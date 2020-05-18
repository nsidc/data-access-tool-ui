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
  mouseDown,
  mouseUp,
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
  private highlightLastPoint: boolean;
  private lonLatEnableCallback: (s: boolean) => void;
  private updateLonLatLabel: (cartesian: Cesium.Cartesian3 | null) => void;
  private mouseHandler: any;
  private points: List<Point> = List<Point>();
  private prevPoint: Point;
  private polygon: any;
  private polyline: any;
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
    this.resetShapes();
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

      this.mouseHandler.setInputAction(this.onMouseDown,
                                       Cesium.ScreenSpaceEventType.LEFT_DOWN);

      this.mouseHandler.setInputAction(this.onMouseUp,
                                       Cesium.ScreenSpaceEventType.LEFT_UP);

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

  private resetShapes = (): void => {
    if (this.polyline) {
      this.scene.primitives.remove(this.polyline);
      Cesium.destroyObject(this.polyline);
      this.polyline = null;
    }
    if (this.polygon) {
      this.scene.primitives.remove(this.polygon);
      Cesium.destroyObject(this.polygon);
      this.polygon = null;
    }
  }

  private renderPolylineFromPoints = (points: List<Point>): void => {
    if (this.points.size < 2) {
      return;
    }

    const cartesiansArray = this.points.map((p) => p && p.cartesian).toJS();

    const line1 = new Cesium.PolylineGeometry({
      positions: cartesiansArray,
    });

    const geometryInstance1 = new Cesium.GeometryInstance({
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.CRIMSON),
      },
      geometry: Cesium.PolylineGeometry.createGeometry(line1),
      id: "polyline",
    });
    this.polyline = new Cesium.Primitive({
      appearance: new Cesium.PolylineColorAppearance({
       translucent: false,
      }),
      asynchronous: false,
      geometryInstances: geometryInstance1,
    });
    this.scene.primitives.add(this.polyline);
    this.scene.requestRender();
  }

  // render the given List of points; this also updates this.points to the given
  // list of points, but sorted clockwiseness
  private renderPolygonFromPoints = (points: List<Point>): void => {
    this.points = this.reopenPolygonPoints(points);

    const cartesiansArray = this.points.map((p) => p && p.cartesian).toJS();

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
    this.resetShapes();
    if (this.state !== PolygonState.drawingPolygon) {
      this.renderPolygonFromPoints(this.points);
    } else {
      this.renderPolylineFromPoints(this.points);
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
      if (this.highlightLastPoint && index === this.points.size - 1) {
        point!.highlight();
      } else if (index === this.activePointIndex) {
        point!.activate();
      } else {
        point!.deactivate();
      }
    }, this);
    this.scene.requestRender();
  }

  private handleMouseCursor(screenPosition: Cesium.Cartesian2) {
    const index = this.pickBillboardPoint(screenPosition);
    if (index >= 0) {
      CesiumUtils.setCursorCrosshair();
    } else {
      CesiumUtils.unsetCursorCrosshair();
    }
  }

  private pickBillboardPoint = (screenPosition: Cesium.Cartesian2): number => {
    const pickedFeatures = this.scene.drillPick(screenPosition, 7, 7);
    let index = -1;
    for (const f of pickedFeatures) {
      const i = this.indexOfPointByBillboard(f.primitive);
      if (i >= 0) {
        index = i;
      }
    }
    return index;
  }

  private doStateTransition = (newState: PolygonState) => {
    this.state = newState;
    this.highlightLastPoint = false;
    if (this.tooltip) {
      switch (this.state) {
        case PolygonState.drawingPolygon:
          this.tooltip.text = "Click to add points\nConnect to first point to finish";
          break;
        case PolygonState.donePolygon:
          this.tooltip.text = "Click and drag a point to edit";
          break;
        case PolygonState.pointActive:
          this.tooltip.text = "Edit lat/lon box or\nclick and drag to move";
          break;
        case PolygonState.movePoint:
          this.tooltip.text = "";
          break;
      }
    }
  }

  // States
  // DrawingPolygon
  //   leftClick: Add new point (transfer mouse point)
  //   moveMouse: Move current mouse point
  //   doubleClick: End polygon, CALLBACK, --> DonePolygon
  // DonePolygon
  //   mouseDown: If on point, activate point --> MovePoint; otherwise deactivate
  //   moveMouse: Check mouse cursor
  // PointActive
  //   mouseDown:  --> DonePolygon, call DonePolygon mouseDown
  //   moveMouse: Check mouse cursor
  //   lonLatTextChange: Move point to new position, CALLBACK
  // MovePoint
  //   mouseUp: Add new point (transfer mouse point), CALLBACK, --> PointActive
  //   moveMouse: Move current mouse point

  private stateTransition = (event: PolygonEvent, screenPositionOrCartesian: Cesium.Cartesian2 | Cesium.Cartesian3) => {
    // usually we're dealing with a 2D screen position, but sometimes (eg when
    // called from changeLonLat) it's a 3D `cartesian`
    const screenPosition = screenPositionOrCartesian as Cesium.Cartesian2;
    const cartesian3 = screenPositionOrCartesian as Cesium.Cartesian3;
    const newCartesian = this.screenPositionToCartesian(screenPosition);

    if (event === PolygonEvent.moveMouse && this.tooltip) {
      let showTooltip = newCartesian !== null && this.tooltip.text !== "";
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
            this.highlightLastPoint = false;
            if (newCartesian !== null) {
              const index = this.pickBillboardPoint(screenPosition);
              if (index >= 0) {
                if (index === 0) {
                  this.doStateTransition(PolygonState.donePolygon);
                  if (this.points.size >= MIN_VERTICES) {
                    this.interactionRender();
                    this.finishedDrawingCallback(this.points);
                  }
                }
              } else {
                this.addPointFromCartesian(newCartesian);
                this.doStateTransition(PolygonState.drawingPolygon);
              }
            }
            this.interactionRender();
            break;
          case PolygonEvent.moveMouse:
            this.highlightLastPoint = false;
            if (newCartesian !== null) {
              const index = this.pickBillboardPoint(screenPosition);
              if (this.points.size >= MIN_VERTICES && index === 0) {
                  this.highlightLastPoint = true;
              }
            }
            this.movePointUsingScreenPosition(screenPosition);
            this.updateLonLatLabel(this.activePointCartesian());
            this.interactionRender();
            break;
          case PolygonEvent.escapeKey:
            if (this.activePointIndex > 0) {
              this.activePointIndex--;
              this.removeActivePoint();
              this.activateLastPoint();
              this.doStateTransition(PolygonState.drawingPolygon);
              this.interactionRender();
            } else {
              this.reset();
              CesiumUtils.unsetCursorCrosshair();
              this.scene.requestRender();
            }
            break;
        }
        break;

      case PolygonState.donePolygon:
        switch (event) {
          case PolygonEvent.mouseDown:
            if (this.points.size === 0) { break; }
            this.lonLatEnableCallback(false);
            const index = this.pickBillboardPoint(screenPosition);
            if (index >= 0) {
              // We clicked on one of the polygon points
              this.activatePoint(index);
              this.prevPoint = this.points.get(this.activePointIndex);
              this.doStateTransition(PolygonState.movePoint);
              this.scene.screenSpaceCameraController.enableInputs = false;
              CesiumUtils.setCursorCrosshair();
            } else {
              // We clicked somewhere else, not on a point
              this.deactivateActivePoint();
            }
            this.interactionRender();
            break;
          case PolygonEvent.moveMouse:
            this.handleMouseCursor(screenPosition);
            this.updateLonLatLabel(newCartesian);
            break;
        }
        break;

      case PolygonState.pointActive:
        switch (event) {
          case PolygonEvent.mouseDown:
            this.doStateTransition(PolygonState.donePolygon);
            this.stateTransition(PolygonEvent.mouseDown, screenPosition);
            break;
          case PolygonEvent.moveMouse:
            this.handleMouseCursor(screenPosition);
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
        }
        break;

      case PolygonState.movePoint:
        switch (event) {
          case PolygonEvent.moveMouse:
            this.movePointUsingScreenPosition(screenPosition);
            this.updateLonLatLabel(this.activePointCartesian());
            this.interactionRender();
            break;
          case PolygonEvent.mouseUp:
            // We're done moving the point
            this.scene.screenSpaceCameraController.enableInputs = true;
            this.doStateTransition(PolygonState.pointActive);
            CesiumUtils.unsetCursorCrosshair();
            this.updateLonLatLabel(this.activePointCartesian());
            this.lonLatEnableCallback(true);
            this.finishedDrawingCallback(this.points);
            this.interactionRender();
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

  private onMouseDown = ({ position }: { position: Cesium.Cartesian2 }) => {
    this.stateTransition(PolygonEvent.mouseDown, position);
  }

  private onMouseUp = ({ position }: { position: Cesium.Cartesian2 }) => {
    this.stateTransition(PolygonEvent.mouseUp, position);
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
