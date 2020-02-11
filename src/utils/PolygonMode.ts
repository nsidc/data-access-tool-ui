import * as Cesium from "cesium";
import { List } from "immutable";

import { CesiumUtils, ILonLat } from "./CesiumUtils";
import { Point } from "./Point";

enum PolygonState {
  drawingPolygon,
  donePolygon,
  pointActive,
  movePoint,
}

enum PolygonEvent {
  leftClick,
  doubleClick,
  moveMouse,
  lonLatTextChange,
  escapeKey,
}

export const MIN_VERTICES = 3;

export class PolygonMode {

  private activePointIndex: number = -1;
  private billboards: Cesium.BillboardCollection;
  private ellipsoid: Cesium.Ellipsoid;
  private finishedDrawingCallback: any;
  private lonLatEnableCallback: (s: boolean) => void;
  private updateLonLatLabel: (cartesian: Cesium.Cartesian3 | null) => void;
  private mouseHandler: any;
  private points: List<Point> = List<Point>();
  private prevPoint: Point;
  private polygon: any;
  private scene: any;
  private state: PolygonState = PolygonState.donePolygon;
  private tooltip: any;

  public constructor(scene: any, lonLatEnableCallback: (s: boolean) => void,
                     updateLonLatLabel: (cartesian: Cesium.Cartesian3 | null) => void,
                     ellipsoid: Cesium.Ellipsoid, finishedDrawingCallback: any) {
    this.scene = scene;
    this.lonLatEnableCallback = lonLatEnableCallback;
    this.updateLonLatLabel = updateLonLatLabel;
    this.ellipsoid = ellipsoid;
    this.finishedDrawingCallback = finishedDrawingCallback;
    document.addEventListener("keydown", this.onKeyDown, false);
  }

  public start = () => {
    this.initializeMouseHandler();
    this.initializeBillboards();
    this.initializeTooltip();
    this.doStateTransition(PolygonState.drawingPolygon);
  }

  public reset = () => {
    const didHavePoints = this.points.size >= MIN_VERTICES;
    this.clearAllPoints();
    this.deactivateActivePoint();
    this.scene.primitives.removeAll();
    this.tooltip = null;
    this.lonLatEnableCallback(false);
    this.updateLonLatLabel(null);
    // Avoid doing a CMR refresh if our polygon was already empty.
    if (didHavePoints) {
      this.finishedDrawingCallback(this.points);
    }
    this.doStateTransition(PolygonState.drawingPolygon);
    if (this.mouseHandler && !this.mouseHandler.isDestroyed()) {
      this.mouseHandler.destroy();
      this.mouseHandler = null;
    }
    this.scene.requestRender();
  }

  public changeLonLat(sLonLat: string) {
    if (this.activePointIndex !== -1) {
      const point = this.activePoint();
      if (CesiumUtils.getLonLatLabel(point.cartesian) === sLonLat) {
        return;
      }
    }
    const lonLat = this.parseLonLat(sLonLat);
    if (isNaN(lonLat.lat) || isNaN(lonLat.lon)) {
      return;
    }
    const cartesian = this.lonLatToCartesian(lonLat);
    this.updateLonLatLabel(cartesian);
    this.stateTransition(PolygonEvent.lonLatTextChange, cartesian);
  }

  public resetLonLat() {
    if (this.activePointIndex >= 0) {
      const point = this.activePoint();
      this.updateLonLatLabel(point.cartesian);
    }
  }

  public activateRelativePoint(delta: number) {
    if (this.activePointIndex >= 0) {
      // Add this.points.size so that this function works with a positive or
      // negative delta. Note that (this.points.size % this.points.size === 0)
      const nextIndex = (this.activePointIndex + delta + this.points.size) % this.points.size;

      this.activatePoint(nextIndex);
      this.updateLonLatLabel(this.activePointCartesian());
      this.updateBillboardsAppearanceForActivePoint();
    }
  }

  public lonLatToCartesian(lonLat: ILonLat): Cesium.Cartesian3 {
    return CesiumUtils.lonLatToCartesian(lonLat, this.ellipsoid);
  }

  // called for a spatial selection that was saved in localStorage
  // or if you import a polygon
  public polygonFromLonLats(lonLatsArray: number[][]) {
    this.state = PolygonState.donePolygon;

    this.clearAllPoints();
    this.scene.primitives.removeAll();
    this.tooltip = null;
    this.initializeBillboards();

    const cartesians = lonLatsArray.map((coord: number[]) => {
      const [lon, lat] = coord;
      return this.lonLatToCartesian({lon, lat});
    });

    let points: List<Point> = List(cartesians).map((cartesian?: Cesium.Cartesian3) => {
      return new Point(cartesian);
    }).toList();
    points = this.reopenPolygonPoints(points);

    points.forEach(this.addPoint);

    this.renderPolygonFromPoints(this.points);
    this.initializeMouseHandler();
    this.initializeTooltip();
    this.doStateTransition(PolygonState.donePolygon);
  }

  private clearAllPoints = () => {
    this.points = List<Point>();
    if (this.billboards && this.billboards.length && !this.billboards.isDestroyed()) {
      this.billboards.removeAll();
    }
  }

  private initializeMouseHandler = () => {
    if (!this.mouseHandler) {
      this.mouseHandler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);

      this.mouseHandler.setInputAction(this.onLeftClick,
                                       Cesium.ScreenSpaceEventType.LEFT_CLICK);

      this.mouseHandler.setInputAction(this.onLeftDoubleClick,
                                       Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

      this.mouseHandler.setInputAction(this.onMouseMove,
                                       Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
  }

  private initializeTooltip = () => {
    const labels = this.scene.primitives.add(new Cesium.LabelCollection());
    this.tooltip = labels.add({
      backgroundColor: Cesium.Color.fromAlpha(Cesium.Color.BLACK, 0.4),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      font: "10pt sans-serif",
      horizontalOrigin: Cesium.HorizontalOrigin.RIGHT,
      pixelOffset: new Cesium.Cartesian2(-10, -10),
      show: false,
      showBackground: true,
      text: "",
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    });
  }

  // render the given List of points; this also updates this.points to the given
  // list of points, but sorted clockwiseness
  private renderPolygonFromPoints = (points: List<Point>): void => {
    this.points = this.reopenPolygonPoints(points);

    const cartesiansArray = this.points.map((p) => p && p.cartesian).toJS();

    // remove previously rendered polygon
    if (this.polygon) {
      this.scene.primitives.remove(this.polygon);
      Cesium.destroyObject(this.polygon);
    }

    const appearance = new Cesium.EllipsoidSurfaceAppearance({
      aboveGround: false,
    });
    const geometry = Cesium.PolygonGeometry.createGeometry(Cesium.PolygonGeometry.fromPositions({
      ellipsoid: this.ellipsoid,
      positions: cartesiansArray,
    }));

    // The geometry can be undefined if all 3 points are on a line, etc.
    if (geometry !== undefined) {
      const geometryInstances = new Cesium.GeometryInstance({
        geometry,
        id: "polygon",
      });
      this.polygon = new Cesium.Primitive({
        appearance,
        asynchronous: false,
        geometryInstances,
      });
      this.scene.primitives.add(this.polygon);
    }

    this.scene.requestRender();
  }

  private parseLonLat(sLonLat: string): ILonLat {
    let s = sLonLat.split(",");
    if (s.length < 2) {
      s = sLonLat.split(" ");
    }
    if (s.length < 2) {
      return { lat: NaN, lon: NaN };
    }
    s = s.map((s1) => s1.trim().toUpperCase());
    let lat = parseFloat(s[0]);
    if (s[0].endsWith("S")) {
      lat = -lat;
    }
    let lon = parseFloat(s[1]);
    if (s[1].endsWith("W")) {
      lon = -lon;
    }
    return {lat, lon};
  }

  private interactionRender = () => {
    // if we meet the minimum points requirement, render the polygon
    if (this.points.size >= MIN_VERTICES) {
      this.renderPolygonFromPoints(this.points);
    }

    this.updateBillboardsAppearanceForActivePoint();
  }

  private screenPositionToCartesian = (screenPosition: Cesium.Cartesian2): Cesium.Cartesian3 | null => {
    return CesiumUtils.screenPositionToCartesian(screenPosition, this.scene.camera, this.ellipsoid);
  }

  private isDuplicateCartesian = (cartesian: Cesium.Cartesian3): boolean => {
    const tolerance = 1e-6;
    return this.points.some((point) => {
      return cartesian.equalsEpsilon(point!.cartesian, tolerance, tolerance);
    });
  }

  private addPointFromScreenPosition = (screenPosition: Cesium.Cartesian2) => {
    const cartesian = this.screenPositionToCartesian(screenPosition);
    if (cartesian === null) { return; }
    return this.addPointFromCartesian(cartesian);
  }

  private addPointFromCartesian = (cartesian: Cesium.Cartesian3) => {
    const point = new Point(cartesian);
    this.addPoint(point);
  }

  // point only includes `| undefined` in the type annotation to appease
  // Immutable 3.x's bad type declarations
  private addPoint = (point: Point | undefined): void => {
    point!.addBillboard(this.billboards);
    this.points = this.points.push(point!);
  }

  private initializeBillboards = () => {
    this.billboards = new Cesium.BillboardCollection();
    this.scene.primitives.add(this.billboards);
  }

  private updateActivePointFromCartesian = (cartesian: Cesium.Cartesian3) => {
    if (this.activePointIndex !== -1) {
      this.activePoint().removeBillboard(this.billboards);
      const point = new Point(cartesian);
      this.points = this.points.update(this.activePointIndex, (v) => (point));
      point!.addBillboard(this.billboards);
    }
  }

  private updateActivePointFromScreen = (screenPosition: Cesium.Cartesian2) => {
    const cartesian = this.screenPositionToCartesian(screenPosition);
    if (cartesian === null) { return; }
    this.updateActivePointFromCartesian(cartesian);
  }

  private movePointUsingScreenPosition = (screenPosition: Cesium.Cartesian2) => {
    if (this.activePointIndex === -1) {
      this.addPointFromScreenPosition(screenPosition);
      this.activateLastPoint();
    } else {
      this.updateActivePointFromScreen(screenPosition);
    }
  }

  private removeActivePoint = () => {
    if (this.activePointIndex !== -1) {
      this.points.get(this.activePointIndex).removeBillboard(this.billboards);
      this.points = this.points.remove(this.activePointIndex);
    }
    this.deactivateActivePoint();
  }

  private deactivateActivePoint = () => {
    this.activePointIndex = -1;
  }

  private activePoint = (): Point => {
    return this.points.get(this.activePointIndex);
  }

  private activatePoint = (index: number) => {
    this.activePointIndex = index;
  }

  private activateLastPoint = () => {
    this.activatePoint(this.points.size - 1);
  }

  private activePointCartesian = (): Cesium.Cartesian3 | null => {
    if (this.activePointIndex === -1) { return null; }

    return this.activePoint().cartesian;
  }

  private updateBillboardsAppearanceForActivePoint = () => {
    this.points.forEach((point, index) => {
      if (index === this.activePointIndex) {
        point!.activate();
      } else {
        point!.deactivate();
      }
    }, this);
    this.scene.requestRender();
  }

  private handleMouseCursor(screenPosition: Cesium.Cartesian2) {
    const mouseoverFeature = this.scene.pick(screenPosition);
    const mouseoverIndex = (mouseoverFeature !== undefined) ?
      this.indexOfPointByBillboard(mouseoverFeature.primitive) : -1;
    if (mouseoverIndex >= 0) {
      CesiumUtils.setCursorCrosshair();
    } else {
      CesiumUtils.unsetCursorCrosshair();
    }
  }

  private doStateTransition = (newState: PolygonState) => {
    this.state = newState;
    if (this.tooltip) {
      switch (this.state) {
        case PolygonState.drawingPolygon:
          this.tooltip.text = "Click to add points\ndouble click to finish";
          break;
        case PolygonState.donePolygon:
          this.tooltip.text = "Click a point to edit\ndouble click to move";
          break;
        case PolygonState.pointActive:
          this.tooltip.text = "Edit lat/lon box or\nclick point to move";
          break;
        case PolygonState.movePoint:
          this.tooltip.text = "Click to set new location";
          break;
      }
    }
  }

  // States
  // DrawingPolygon
  //   leftClick: Add new point (transfer mouse point)
  //   moveMouse: Move current mouse point
  //   doubleClick: End polygon, CALLBACK, --> DonePolygon
  //   lonLatTextChange: nop
  // DonePolygon
  //   leftClick: If on point, activate point --> PointActive
  //   moveMouse: Check mouse cursor
  //   doubleClick: nop
  //   lonLatTextChange: nop
  // PointActive
  //   leftClick: If not on point, deactivate point --> DonePolygon
  //              If different point, activate it (deactivating the other)
  //              If on point, transfer to mouse point --> MovePoint
  //   moveMouse: Check mouse cursor
  //   doubleClick: nop
  //   lonLatTextChange: Move point to new position, CALLBACK
  // MovePoint
  //   leftClick: Add new point (transfer mouse point), CALLBACK, --> PointActive
  //   moveMouse: Move current mouse point
  //   doubleClick: nop
  //   lonLatTextChange: nop

  private stateTransition = (event: PolygonEvent, screenPositionOrCartesian: Cesium.Cartesian2 | Cesium.Cartesian3) => {
    // usually we're dealing with a 2D screen position, but sometimes (eg when
    // called from changeLonLat) it's a 3D `cartesian`
    const screenPosition = screenPositionOrCartesian as Cesium.Cartesian2;
    const cartesian3 = screenPositionOrCartesian as Cesium.Cartesian3;
    const newCartesian = this.screenPositionToCartesian(screenPosition);

    if (event === PolygonEvent.moveMouse && this.tooltip) {
      let showTooltip = newCartesian !== null;
      if (this.state === PolygonState.donePolygon || this.state === PolygonState.pointActive) {
        const pickedFeature = this.scene.pick(screenPosition);
        if (!(pickedFeature && (pickedFeature.id === "polygon" ||
          pickedFeature.collection === this.billboards))) {
          showTooltip = false;
        }
      }
      if (showTooltip) {
        this.tooltip.position = newCartesian;
        this.tooltip.show = true;
      } else {
        this.tooltip.show = false;
      }
      this.scene.requestRender();
    }

    switch (this.state) {
      case PolygonState.drawingPolygon:
        switch (event) {
          case PolygonEvent.leftClick:
            // Add a new point to the polygon, keep drawing
            this.removeActivePoint();
            if (newCartesian !== null && !this.isDuplicateCartesian(newCartesian)) {
              this.addPointFromCartesian(newCartesian);
              this.doStateTransition(PolygonState.drawingPolygon);
            }
            this.interactionRender();
            break;
          case PolygonEvent.moveMouse:
            this.movePointUsingScreenPosition(screenPosition);
            this.updateLonLatLabel(this.activePointCartesian());
            this.interactionRender();
            break;
          case PolygonEvent.doubleClick:
            this.doStateTransition(PolygonState.donePolygon);
            if (this.points.size >= MIN_VERTICES) {
              this.removeActivePoint();
              this.interactionRender();
              this.finishedDrawingCallback(this.points);
            }
            break;
          case PolygonEvent.lonLatTextChange:
            // nop
            break;
          case PolygonEvent.escapeKey:
            this.removeActivePoint();
            this.activateLastPoint();
            if (this.points.size < MIN_VERTICES && this.polygon) {
              this.scene.primitives.remove(this.polygon);
              Cesium.destroyObject(this.polygon);
              this.polygon = null;
            }
            this.doStateTransition(PolygonState.drawingPolygon);
            this.scene.requestRender();
            break;
        }
        break;

      case PolygonState.donePolygon:
        switch (event) {
          case PolygonEvent.leftClick:
            if (this.points.size === 0) { break; }
            const pickedFeature = this.scene.pick(screenPosition);
            const index = (pickedFeature !== undefined) ?
              this.indexOfPointByBillboard(pickedFeature.primitive) : -1;
            if (index >= 0) {
              // We clicked on one of the polygon points
              this.doStateTransition(PolygonState.pointActive);
              this.activatePoint(index);
              this.updateLonLatLabel(this.activePointCartesian());
              this.lonLatEnableCallback(true);
              this.interactionRender();
            }
            break;
          case PolygonEvent.moveMouse:
            this.handleMouseCursor(screenPosition);
            this.updateLonLatLabel(newCartesian);
            break;
          case PolygonEvent.doubleClick:
            // nop
            break;
          case PolygonEvent.lonLatTextChange:
            // nop
            break;
          case PolygonEvent.escapeKey:
            // nop
            break;
        }
        break;

      case PolygonState.pointActive:
        switch (event) {
          case PolygonEvent.leftClick:
            if (this.points.size === 0) { break; }
            const pickedFeature = this.scene.pick(screenPosition);
            const index = (pickedFeature !== undefined) ?
              this.indexOfPointByBillboard(pickedFeature.primitive) : -1;
            if (index < 0) {
              // We clicked somewhere else, not on a point
              this.doStateTransition(PolygonState.donePolygon);
              this.lonLatEnableCallback(false);
              this.deactivateActivePoint();
              this.interactionRender();
              break;
            }
            if (this.activePointIndex !== index) {
              // We clicked on a new point, so activate it instead
              this.activatePoint(index);
              this.updateLonLatLabel(this.activePointCartesian());
              this.interactionRender();
              break;
            }
            // We clicked on the active point
            this.prevPoint = this.points.get(this.activePointIndex);
            this.doStateTransition(PolygonState.movePoint);
            this.lonLatEnableCallback(false);
            CesiumUtils.setCursorCrosshair();
            this.interactionRender();
            break;
          case PolygonEvent.moveMouse:
            this.handleMouseCursor(screenPosition);
            break;
          case PolygonEvent.doubleClick:
            // nop
            break;
          case PolygonEvent.lonLatTextChange:
            // We used the edit box to change the coordinates.
            // If point already exists, refuse to change the screenPosition.
            if (this.isDuplicateCartesian(cartesian3)) {
              this.updateLonLatLabel(this.activePointCartesian());
              break;
            }
            this.updateActivePointFromCartesian(cartesian3);
            this.interactionRender();
            this.finishedDrawingCallback(this.points);
            break;
          case PolygonEvent.escapeKey:
            // nop
            break;
        }
        break;

      case PolygonState.movePoint:
        switch (event) {
          case PolygonEvent.leftClick:
            // We're done moving the point
            this.doStateTransition(PolygonState.pointActive);
            CesiumUtils.unsetCursorCrosshair();
            this.updateLonLatLabel(this.activePointCartesian());
            this.lonLatEnableCallback(true);
            this.finishedDrawingCallback(this.points);
            break;
          case PolygonEvent.moveMouse:
            this.movePointUsingScreenPosition(screenPosition);
            this.updateLonLatLabel(this.activePointCartesian());
            this.interactionRender();
            break;
          case PolygonEvent.doubleClick:
            // nop - this allows doubleClick to immediately activate and start moving a point
            break;
          case PolygonEvent.lonLatTextChange:
            // nop
            break;
          case PolygonEvent.escapeKey:
            this.updateActivePointFromCartesian(this.prevPoint.cartesian);
            this.stateTransition(PolygonEvent.leftClick, new Cesium.Cartesian2());
            this.interactionRender();
            break;
        }
        break;
    }
  }

  private onKeyDown = (event: any): void => {
    if (event.key === "Escape") {
      this.stateTransition(PolygonEvent.escapeKey, new Cesium.Cartesian2());
    }
  }

  private onLeftClick = ({position}: {position: Cesium.Cartesian2}) => {
    this.stateTransition(PolygonEvent.leftClick, position);
  }

  private onLeftDoubleClick = ({position}: {position: Cesium.Cartesian2}) => {
    this.stateTransition(PolygonEvent.doubleClick, position);
  }

  private onMouseMove = ({endPosition}: {endPosition: Cesium.Cartesian2}) => {
    this.stateTransition(PolygonEvent.moveMouse, endPosition);
  }

  private indexOfPointByBillboard = (billboard: Cesium.Billboard): number => {
    return this.points.findIndex((point) => {
      if (point === undefined) { return false; }

      return billboard === point.getBillboard();
    });
  }

  // `points` needs to be a "closed" polygon (first point === last point) for
  // CMR requests, but Cesium doesn't like that, so in some cases we need to
  // "unclose" the polygon by removing the last point if it equals the first
  // point
  private reopenPolygonPoints = (points: List<Point>): List<Point> => {
    const first = points.first().cartesian;
    const last = points.last().cartesian;

    return first.equals(last) ? points.pop() : List(points);
  }
}
