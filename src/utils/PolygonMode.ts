import { List } from "immutable";

import { CesiumUtils, IBillboard, IBillboardCollection, ICartesian3, IScreenPosition } from "./CesiumUtils";
import { Point } from "./Point";

/* tslint:disable:no-var-requires */
const Cesium = require("cesium/Cesium");
/* tslint:enable:no-var-requires */

interface ILonLat {
  readonly lat: number;
  readonly lon: number;
  readonly index?: number;
}

enum PolygonState {
  drawingPolygon,
  donePolygon,
  pointSelected,
  movePoint,
}

enum PolygonEvent {
  leftClick,
  doubleClick,
  moveMouse,
  lonLatTextChange,
}

// NOTE: Exported for testing only. Un-export once we find a way to test without exporting.
export const cartesiansEqual = (p1: ICartesian3, p2: ICartesian3, tolerance: number = 0): boolean => {
  return (Math.abs(p1.x - p2.x) <= tolerance
          && Math.abs(p1.y - p2.y) <= tolerance
          && Math.abs(p1.z - p2.z) <= tolerance);
};

export const MIN_VERTICES = 3;

export class PolygonMode {

  private billboards: IBillboardCollection;
  private ellipsoid: any;
  private finishedDrawingCallback: any;
  private lonLatEnableCallback: (s: boolean) => void;
  private lonLatLabelCallback: (s: string) => void;
  private mouseHandler: any;
  private mousePointIndex: number = -1;
  private points: List<Point> = List<Point>();
  private polygon: any;
  private scene: any;
  private state: PolygonState = PolygonState.donePolygon;

  public constructor(scene: any, lonLatEnableCallback: (s: boolean) => void,
                     lonLatLabelCallback: (s: string) => void,
                     ellipsoid: any, finishedDrawingCallback: any) {
    this.scene = scene;
    this.lonLatEnableCallback = lonLatEnableCallback;
    this.lonLatLabelCallback = lonLatLabelCallback;
    this.ellipsoid = ellipsoid;
    this.finishedDrawingCallback = finishedDrawingCallback;
    this.billboards = new Cesium.BillboardCollection();
  }

  public start = () => {
    this.initializeMouseHandler();
    this.initializeBillboards();
  }

  public reset = () => {
    this.clearAllPoints();
    this.clearMousePoint();
    this.scene.primitives.removeAll();
    this.lonLatEnableCallback(false);
    this.lonLatLabelCallback("");
    this.finishedDrawingCallback(this.points);
    this.state = PolygonState.drawingPolygon;
    if (this.mouseHandler && !this.mouseHandler.isDestroyed()) {
      this.mouseHandler.destroy();
      this.mouseHandler = null;
    }
  }

  // cartesian: 3D coordinates for position on earth's surface
  // https://en.wikipedia.org/wiki/ECEF
  public cartesianPositionToLonLatDegrees(cartesian: ICartesian3): ILonLat {
    // this means the position is not on the globe
    if (cartesian === undefined) {
      return {lat: NaN, lon: NaN};
    }

    const cartographicRadians = Cesium.Cartographic.fromCartesian(cartesian);

    const lonLatDegrees = {
      lat: Number.parseFloat(Cesium.Math.toDegrees(cartographicRadians.latitude)),
      lon: Number.parseFloat(Cesium.Math.toDegrees(cartographicRadians.longitude)),
    };

    return lonLatDegrees;
  }

  public changeLonLat(sLonLat: string) {
    const lonLat = this.parseLonLat(sLonLat);
    if (isNaN(lonLat.lat) || isNaN(lonLat.lon)) {
      return;
    }
    const cartesian = this.lonLatToCartesianPosition(lonLat);
    this.updateLonLatLabel(cartesian);
    this.stateTransition(PolygonEvent.lonLatTextChange, cartesian);
  }

  public resetLonLat() {
    if (this.mousePointIndex >= 0) {
      const point = this.mousePoint();
      this.updateLonLatLabel(point.cartesian);
    }
  }

  public selectNextPoint() {
    if (this.mousePointIndex >= 0) {
      this.mousePointIndex = (this.mousePointIndex + 1) % this.points.size;
      this.updateLonLatLabel(this.mouseCartesian());
      this.interactionRender();
    }
  }

  public selectPreviousPoint() {
    if (this.mousePointIndex >= 0) {
      this.mousePointIndex = (this.mousePointIndex > 0) ?
        (this.mousePointIndex - 1) : (this.points.size - 1);
      this.updateLonLatLabel(this.mouseCartesian());
      this.interactionRender();
    }
  }

  public lonLatToCartesianPosition(lonLat: ILonLat): ICartesian3 {
    const cart = Cesium.Cartographic.fromDegrees(lonLat.lon, lonLat.lat);
    const point = Cesium.Cartographic.toCartesian(cart, this.ellipsoid);
    return point;
  }

  // should only be called when initially rendering a spatial selection that was
  // saved in localStorage
  public polygonFromLonLats(lonLatsArray: number[][]) {
    if (this.state !== PolygonState.donePolygon) { return; }

    this.clearAllPoints();
    this.initializeBillboards();

    const cartesians = lonLatsArray.map((coord: number[]) => {
      const [lon, lat] = coord;
      return this.lonLatToCartesianPosition({lon, lat});
    });

    let points: List<Point> = List(cartesians).map((cartesian?: ICartesian3) => {
      return new Point(cartesian);
    }).toList();
    points = this.sortedPoints(this.reopenPolygonPoints(points));

    points.forEach(this.addPoint);

    this.renderPolygonFromPoints(this.points);
    this.initializeMouseHandler();
  }

  private clearAllPoints = () => {
    this.points = List<Point>();
    if (this.billboards && this.billboards.length) {
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

  private renderPolygonFromPoints = (points: List<Point>): void => {
    const sortedPoints = this.sortedPoints(this.reopenPolygonPoints(points));
    const pointsToRender = sortedPoints;

    this.points = sortedPoints;

    const cartesiansArray = pointsToRender.map((p) => p && p.cartesian).toJS();

    // remove previously rendered polygon
    if (this.polygon) {
      this.scene.primitives.remove(this.polygon);
      Cesium.destroyObject(this.polygon);
    }

    const appearance = new Cesium.EllipsoidSurfaceAppearance({
      aboveGround: false,
    });
    const geometry = Cesium.PolygonGeometry.fromPositions({
      ellipsoid: this.ellipsoid,
      positions: cartesiansArray,
    });

    const geometryInstances = new Cesium.GeometryInstance({
      geometry,
    });
    this.polygon = new Cesium.Primitive({
      appearance,
      asynchronous: false,
      geometryInstances,
    });
    this.scene.primitives.add(this.polygon);
  }

  private sortedPoints = (points: List<Point>): List<Point> => {
    const cartesians = points.map((p) => p && p.cartesian) as List<ICartesian3>;

    // Ensure that the points are in counterclockwise non-overlapping order.
    const sortedIndices = this.sortedPolygonPointIndices(cartesians);
    const pointsInSortedOrder = sortedIndices.map((sortedIndex: number | undefined) => {
      if (sortedIndex === undefined) { throw new Error("wat"); }

      return points.get(sortedIndex);
    }).toList();

    return pointsInSortedOrder;
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

  // To avoid bow-ties if the user draws the points in a strange order,
  // reorder the points to ensure that they form a counterclockwise
  // non-overlapping polygon.
  // To reorder, convert points to 2D, compute the angle between each point
  // and the center of the bounding box for all the points. Then sort
  // the angles into ascending order.
  // Returns an array of indices that sort points into correct order.
  // For algorithm see https://stackoverflow.com/questions/19713092/
  private sortedPolygonPointIndices(cartesians: List<ICartesian3>): List<number> {

    // Convert all points from 3D to 2D, save the original points.
    // Compute the bounding box for all the points.
    let lonLats = cartesians.map((cartesian, index): ILonLat => {
      if (!cartesian) { throw new Error("wat"); }

      const lonLat = this.cartesianPositionToLonLatDegrees(cartesian);
      return {index, ...lonLat};
    });

    const lats = lonLats.map((lonLat) => lonLat!.lat);
    const lons = lonLats.map((lonLat) => lonLat!.lon);

    const center = {
      lat: 0.5 * (lats.min() + lats.max()),
      lon: 0.5 * (lons.min() + lons.max()),
    };
    const last = lonLats.last();
    const angleLast = Math.atan2(last.lat - center.lat, last.lon - center.lon);

    lonLats = lonLats.map((lonLat) => {
      let angle = Math.atan2(lonLat!.lat - center.lat, lonLat!.lon - center.lon);
      // Rotate (shift) all of the points that come before the last point
      // to the end of the array. The <= ensures that the last point comes
      // at the very end, since that is the mousePoint and will need to be
      // stripped off the end before storing.
      if (angle <= angleLast) {
        angle += 2 * Math.PI;
      }
      return {...lonLat!, angle};
    });

    // Sort the points in counter-clockwise order using the 2D angles
    lonLats = lonLats.sort((a: any, b: any) => (a.angle - b.angle));

    // Strip out the indices that will sort the array
    const indices = lonLats.map((lonLat): number => {
      if ((lonLat === undefined) || (lonLat.index === undefined)) { throw new Error("wat"); }

      return lonLat.index;
    }).toList();
    return indices;
  }

  private interactionRender = () => {
    // if we meet the minimum points requirement, render the polygon
    if (this.points.size >= MIN_VERTICES) {
      this.renderPolygonFromPoints(this.points);
    }

    this.updateBillboardsAppearanceForMousePoint();
  }

  private screenPositionToCartesian = (screenPosition: IScreenPosition): ICartesian3 | null => {
    if (screenPosition === null) { return null; }

    const cartesian = this.scene.camera.pickEllipsoid(screenPosition, this.ellipsoid);
    if (!cartesian) { return null; }
    return cartesian;
  }

  private isDuplicateCartesian = (cartesian: ICartesian3): boolean => {
    const tolerance = 1e-6;
    return this.points.some((point: Point | undefined) => {
      if (point === undefined) { throw new Error("wat"); }
      return cartesiansEqual(cartesian, point.cartesian, tolerance);
    });
  }

  private addPointFromScreenPosition = (screenPosition: IScreenPosition) => {
    const cartesian = this.screenPositionToCartesian(screenPosition);
    if (cartesian === null) { return; }

    return this.addPointFromCartesian(cartesian);
  }

  private addPointFromCartesian = (cartesian: ICartesian3) => {
    if (this.isDuplicateCartesian(cartesian)) { return; }

    const point = new Point(cartesian);

    this.addPoint(point);
  }

  private addPoint = (point: Point | undefined): void => {
    if (point === undefined) { throw new Error("wat"); }

    point.addBillboard(this.billboards);
    this.points = this.points.push(point);
  }

  private removePoint = (index: number): void => {
    if ((index < 0) || (index > this.points.size)) {
      console.warn(`removePoint called with index = ${index}; this.points.size == ${this.points.size}`);
    }

    this.points.get(index).removeBillboard(this.billboards);
    this.points = this.points.remove(index);
  }

  private initializeBillboards = () => {
    this.billboards = new Cesium.BillboardCollection();
    this.scene.primitives.add(this.billboards);
  }

  private updateMousePoint = (screenPosition: IScreenPosition) => {
    const cartesian = this.screenPositionToCartesian(screenPosition);
    if (cartesian === null) { return; }

    this.clearMousePoint();

    this.addPointFromCartesian(cartesian);
    this.mousePointIndex = this.points.size - 1;
  }

  private clearMousePoint = () => {
    if (this.mousePointIndex !== -1) {
      this.removePoint(this.mousePointIndex);
    }
    this.mousePointIndex = -1;
  }

  private mousePoint = (): Point => {
    return this.points.get(this.mousePointIndex);
  }

  private mouseCartesian = (): ICartesian3 | null => {
    if (this.mousePointIndex === -1) { return null; }

    return this.mousePoint().cartesian;
  }

  private updateBillboardsAppearanceForMousePoint = () => {
    this.points.forEach((point, index) => {
      const billboard = point!.getBillboard();

      if (index === this.mousePointIndex) {
        billboard.color = Cesium.Color.CHARTREUSE;
        billboard.scale = 1.5;
      } else {
        billboard.color = Cesium.Color.WHITE;
        billboard.scale = 1.0;
      }
    }, this);
  }

  private handleMouseCursor(screenPosition: IScreenPosition) {
    const mouseoverFeature = this.scene.pick(screenPosition);
    const mouseoverIndex = (mouseoverFeature !== undefined) ?
      this.indexOfPointByBillboard(mouseoverFeature.primitive) : -1;
    if (mouseoverIndex >= 0) {
      CesiumUtils.setCursorCrosshair();
    } else {
      CesiumUtils.unsetCursorCrosshair();
    }
  }

  private updateLonLatLabel(cartesian: ICartesian3 | null) {
    try {
      if (cartesian) {
        const ll = this.cartesianPositionToLonLatDegrees(cartesian);
        const lat1 = Math.round(ll.lat * 100) / 100;
        const lat = "" + Math.abs(lat1) + ((lat1 > 0) ? "N" : "S");
        const lon1 = Math.round(ll.lon * 100) / 100;
        const lon = "" + Math.abs(lon1) + ((lon1 > 0) ? "E" : "W");
        this.lonLatLabelCallback(lat + ", " + lon);
      } else {
        this.lonLatLabelCallback("");
      }
    } catch (error) {
      this.lonLatLabelCallback("");
    }
  }

  // States
  // DrawingPolygon
  //   leftClick: Add new point (transfer mouse point)
  //   moveMouse: Move current mouse point
  //   doubleClick: End polygon, CALLBACK, --> DonePolygon
  //   lonLatTextChange: nop
  // DonePolygon
  //   leftClick: If on point, select point --> PointSelected
  //   moveMouse: Check mouse cursor
  //   doubleClick: nop
  //   lonLatTextChange: nop
  // PointSelected
  //   leftClick: If not on point, deselect point --> DonePolygon
  //              If different point, select it
  //              If on point, transfer to mouse point --> MovePoint
  //   moveMouse: Check mouse cursor
  //   doubleClick: nop
  //   lonLatTextChange: Move point to new position, CALLBACK
  // MovePoint
  //   leftClick: Add new point (transfer mouse point), CALLBACK, --> PointSelected
  //   moveMouse: Move current mouse point
  //   doubleClick: nop
  //   lonLatTextChange: nop

  private stateTransition = (event: PolygonEvent, screenPositionOrCartesian: IScreenPosition | ICartesian3) => {
    // usually we're dealing with a 2D screen position, but sometimes (eg when
    // called from changeLonLat) it's a 3D `cartesian`
    const screenPosition = screenPositionOrCartesian as IScreenPosition;
    const cartesian = screenPositionOrCartesian as ICartesian3;

    switch (this.state) {
      case PolygonState.drawingPolygon:
        switch (event) {
          case PolygonEvent.leftClick:
            // Add a new point to the polygon, keep drawing
            this.clearMousePoint();
            this.addPointFromScreenPosition(screenPosition);
            this.interactionRender();
            break;
          case PolygonEvent.moveMouse:
            this.updateMousePoint(screenPosition);
            this.updateLonLatLabel(this.mouseCartesian());
            this.interactionRender();
            break;
          case PolygonEvent.doubleClick:
            this.state = PolygonState.donePolygon;
            if (this.points.size >= MIN_VERTICES) {
              this.clearMousePoint();
              this.interactionRender();
              this.finishedDrawingCallback(this.points);
            }
            break;
          case PolygonEvent.lonLatTextChange:
            // nop
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
              this.state = PolygonState.pointSelected;
              this.mousePointIndex = index;
              this.updateLonLatLabel(this.mouseCartesian());
              this.lonLatEnableCallback(true);
              this.interactionRender();
            }
            break;
          case PolygonEvent.moveMouse:
            this.handleMouseCursor(screenPosition);
            const point = this.screenPositionToCartesian(screenPosition);
            this.updateLonLatLabel(point);
            break;
          case PolygonEvent.doubleClick:
            // nop
            break;
          case PolygonEvent.lonLatTextChange:
            // nop
            break;
        }
        break;

      case PolygonState.pointSelected:
        switch (event) {
          case PolygonEvent.leftClick:
            if (this.points.size === 0) { break; }
            const pickedFeature = this.scene.pick(screenPosition);
            const index = (pickedFeature !== undefined) ?
              this.indexOfPointByBillboard(pickedFeature.primitive) : -1;
            if (index < 0) {
              // We clicked somewhere else, not on a point
              this.state = PolygonState.donePolygon;
              this.lonLatEnableCallback(false);
              this.mousePointIndex = -1;
              this.interactionRender();
              break;
            }
            if (this.mousePointIndex !== index) {
              // We clicked on a new point, so select it instead
              this.mousePointIndex = index;
              this.updateLonLatLabel(this.mouseCartesian());
              this.interactionRender();
              break;
            }
            // We clicked on the selected point
            this.state = PolygonState.movePoint;
            this.lonLatEnableCallback(false);
            CesiumUtils.setCursorCrosshair();
            this.mousePointIndex = index;
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
            if (this.isDuplicateCartesian(cartesian)) {
              this.updateLonLatLabel(this.mouseCartesian());
              break;
            }
            this.clearMousePoint();
            this.addPointFromCartesian(cartesian);
            // Our selected point will now be at the end of the list
            this.mousePointIndex = this.points.size - 1;
            this.interactionRender();
            this.finishedDrawingCallback(this.points);
            break;
        }
        break;

      case PolygonState.movePoint:
        switch (event) {
          case PolygonEvent.leftClick:
            // We're done moving the point
            this.state = PolygonState.pointSelected;
            CesiumUtils.unsetCursorCrosshair();
            this.clearMousePoint();
            this.addPointFromScreenPosition(screenPosition);
            this.updateLonLatLabel(this.mouseCartesian());
            this.lonLatEnableCallback(true);
            this.finishedDrawingCallback(this.points);
            break;
          case PolygonEvent.moveMouse:
            this.updateMousePoint(screenPosition);
            this.updateLonLatLabel(this.mouseCartesian());
            this.interactionRender();
            break;
          case PolygonEvent.doubleClick:
            // nop - this allows doubleClick to immediately select and start moving a point
            break;
          case PolygonEvent.lonLatTextChange:
            // nop
            break;
        }
        break;
    }
  }

  private onLeftClick = ({position}: {position: IScreenPosition}) => {
    this.stateTransition(PolygonEvent.leftClick, position);
  }

  private onLeftDoubleClick = ({position}: {position: IScreenPosition}) => {
    this.stateTransition(PolygonEvent.doubleClick, position);
  }

  private onMouseMove = ({endPosition}: {endPosition: IScreenPosition}) => {
    this.stateTransition(PolygonEvent.moveMouse, endPosition);
  }

  private indexOfPointByBillboard = (billboard: IBillboard): number => {
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
    const firstCartesian = points.first().cartesian;
    const lastCartesian = points.last().cartesian;

    if (cartesiansEqual(firstCartesian, lastCartesian)) {
      return points.pop();
    }

    return points;
  }
}
