import * as dragImg from "../img/dragIcon.png";
import { CesiumUtils } from "./CesiumUtils";

/* tslint:disable:no-var-requires */
const Cesium = require("cesium/Cesium");
/* tslint:enable:no-var-requires */

interface ILonLat {
  readonly lat: number;
  readonly lon: number;
}

export interface ICartesian3 {
  x: number;
  y: number;
  z: number;
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

const cartesiansEqual = (p1: ICartesian3, p2: ICartesian3, tolerance: number = 0): boolean => {
  return (Math.abs(p1.x - p2.x) <= tolerance
          && Math.abs(p1.y - p2.y) <= tolerance
          && Math.abs(p1.z - p2.z) <= tolerance);
};

export const MIN_VERTICES = 3;

export class PolygonMode {

  private billboardCollection: any;
  private ellipsoid: any;
  private finishedDrawingCallback: any;
  private lonLatEnableCallback: (s: boolean) => void;
  private lonLatLabelCallback: (s: string) => void;
  private mouseHandler: any;
  private mousePoint: ICartesian3 | null = null;
  private points: ICartesian3[] = [];
  private polygon: any;
  private scene: any;
  private selectedPoint: number = -1;
  private state: PolygonState = PolygonState.drawingPolygon;

  public constructor(scene: any, lonLatEnableCallback: (s: boolean) => void,
                     lonLatLabelCallback: (s: string) => void,
                     ellipsoid: any, finishedDrawingCallback: any) {
    this.scene = scene;
    this.lonLatEnableCallback = lonLatEnableCallback;
    this.lonLatLabelCallback = lonLatLabelCallback;
    this.ellipsoid = ellipsoid;
    this.finishedDrawingCallback = finishedDrawingCallback;
  }

  public start = () => {
    this.initializeMouseHandler();
    this.initializeBillboardCollection();
  }

  public reset = () => {
    this.selectedPoint = -1;
    this.points = [];
    this.clearAllBillboards();
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

  // point: 3D coordinates for position on earth's surface
  // https://en.wikipedia.org/wiki/ECEF
  public cartesianPositionToLonLatDegrees(point: ICartesian3): ILonLat {
    // this means the position is not on the globe
    if (point === undefined) {
      return {lat: NaN, lon: NaN};
    }

    const cartographicRadians = Cesium.Cartographic.fromCartesian(point);

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
    const position = this.lonLatToCartesianPosition(lonLat);
    this.updateLonLatLabel(position);
    this.stateTransition(PolygonEvent.lonLatTextChange
  , position);
  }

  public resetLonLat() {
    if (this.selectedPoint >= 0) {
      const position = this.points[this.selectedPoint];
      this.updateLonLatLabel(position);
    }
  }

  public nextPoint() {
    if (this.selectedPoint >= 0) {
      this.selectedPoint = (this.selectedPoint + 1) % this.points.length;
      this.updateLonLatLabel(this.points[this.selectedPoint]);
      this.interactionRender();
    }
  }

  public previousPoint() {
    if (this.selectedPoint >= 0) {
      this.selectedPoint = (this.selectedPoint > 0) ?
        (this.selectedPoint - 1) : (this.points.length - 1);
      this.updateLonLatLabel(this.points[this.selectedPoint]);
      this.interactionRender();
    }
  }

  public billboardCollectionFromPoints = (points: ICartesian3[]): void => {
    this.clearAllBillboards();
    this.initializeBillboardCollection();

    if (cartesiansEqual(points[0], points[points.length - 1])) {
      points.pop();
    }
    points.forEach((point) => {
      this.addBillboard(point);
    });
  }

  public renderPolygonFromPoints = (points: ICartesian3[]): void => {
    if (cartesiansEqual(points[0], points[points.length - 1])) {
      points.pop();
    }

    // Ensure that the points are in counterclockwise non-overlapping order.
    const indices = this.sortedPolygonPointIndices(points);

    this.points = [];
    indices.forEach((index) => {
      this.points.push(points[index]);
    });

    // For rendering, make a copy of our reordered points
    const pointsCopy = this.points.slice();

    if (this.mousePoint !== null) {
      this.points.pop();
    }

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
      positions: pointsCopy,
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

  public lonLatToCartesianPosition(lonLat: ILonLat): ICartesian3 {
    const cart = Cesium.Cartographic.fromDegrees(lonLat.lon, lonLat.lat);
    const point = Cesium.Cartographic.toCartesian(cart, this.ellipsoid);
    return point;
  }

  public initializeMouseHandler = () => {
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

  public setStateDoneDrawing() {
    this.state = PolygonState.donePolygon;
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
  private sortedPolygonPointIndices(points: ICartesian3[]): number[] {

    // Convert all points from 3D to 2D, save the original points.
    // Compute the bounding box for all the points.
    let lonLatsArray = points.map((point: ICartesian3, index) => {
      const lonLat = this.cartesianPositionToLonLatDegrees(point);
      return {index, ...lonLat};
    });

    const minLat = Math.min.apply(null, lonLatsArray.map((p) => p.lat));
    const maxLat = Math.max.apply(null, lonLatsArray.map((p) => p.lat));
    const minLon = Math.min.apply(null, lonLatsArray.map((p) => p.lon));
    const maxLon = Math.max.apply(null, lonLatsArray.map((p) => p.lon));

    const center = {lat: 0.5 * (minLat + maxLat),
      lon: 0.5 * (minLon + maxLon)};
    const last = lonLatsArray[lonLatsArray.length - 1];
    const angleLast = Math.atan2(last.lat - center.lat, last.lon - center.lon);

    lonLatsArray = lonLatsArray.map((lonLat) => {
      let angle = Math.atan2(lonLat.lat - center.lat, lonLat.lon - center.lon);
      // Rotate (shift) all of the points that come before the last point
      // to the end of the array. The <= ensures that the last point comes
      // at the very end, since that is the mousePoint and will need to be
      // stripped off the end before storing.
      if (angle <= angleLast) {
        angle += 2 * Math.PI;
      }
      return {...lonLat, angle};
    });

    // Sort the points in counter-clockwise order using the 2D angles
    lonLatsArray.sort((a: any, b: any) => (a.angle - b.angle));

    // Strip out the indices that will sort the array
    const indices = lonLatsArray.map((lonLat) => lonLat.index);
    return indices;
  }

  private interactionRender = () => {
    // gather all the points; rendering doesn't care about the distinction
    // between clicked points and the point following the cursor
    const points = (this.mousePoint !== null) ?
      this.points.concat([this.mousePoint]) : this.points.slice();

    // if we meet the minimum points requirement, render the polygon
    if (points.length >= MIN_VERTICES) {
      this.renderPolygonFromPoints(points);
    }

    this.drawSelectedPoint();
  }

  private screenPositionToPoint = (position: any): ICartesian3 | null => {
    if (position === null) { return null; }

    const cartesian = this.scene.camera.pickEllipsoid(position, this.ellipsoid);
    if (!cartesian) { return null; }
    return cartesian;
  }

  private isDuplicatePoint = (point: ICartesian3): boolean => {
    const tolerance = 1e-6;
    for (const p of this.points) {
      if (cartesiansEqual(point, p, tolerance)) {
        return true;
      }
    }
    return false;
  }

  private addPoint = (position: any) => {
    const point = this.screenPositionToPoint(position);
    if (point === null) { return; }

    // Filter out duplicate points caused by the user clicking twice on the
    // same position, or clicking and then double-clicking.
    if (this.isDuplicatePoint(point)) { return; }

    this.points.push(point);
    this.addBillboard(point);
  }

  private initializeBillboardCollection = () => {
    this.billboardCollection = new Cesium.BillboardCollection();
    this.scene.primitives.add(this.billboardCollection);
  }

  private addBillboard = (point: ICartesian3) => {
    this.billboardCollection.add({
      image: dragImg,
      position: point,
    });
  }

  private removeBillboard = (index: number) => {
    this.billboardCollection.remove(this.billboardCollection.get(index));
  }

  private removeLastBillboard = () => {
    const lastIndex = this.billboardCollectionLength() - 1;
    this.removeBillboard(lastIndex);
  }

  private clearAllBillboards = () => {
    if (this.billboardCollection && (this.billboardCollection.length > 0)) {
      this.billboardCollection.removeAll();
    }
  }

  private indexOfBillboard = (billboard: any): number => {
    if (!this.billboardCollection.contains(billboard)) { return -1; }

    for (let index = 0; index < this.billboardCollectionLength(); index++) {
      if (billboard === this.billboardCollection.get(index)) {
        return index;
      }
    }

    // this point should never be reached; either -1 is returned immediately or
    // the right billboard is found in the for loop
    console.warn("PolygonMode.indexOfBillboard returning -1 after iteration");
    return -1;
  }

  private billboardCollectionLength = (): number => {
    return this.billboardCollection ? this.billboardCollection.length : 0;
  }

  private updateMousePoint = (position: any) => {
    const point = this.screenPositionToPoint(position);
    if (point === null) { return; }

    this.clearMousePoint();
    this.mousePoint = point;
    this.addBillboard(point);

    // Our selected point will now be at the end of the list
    this.selectedPoint = this.billboardCollectionLength() - 1;
  }

  private clearMousePoint = () => {
    this.mousePoint = null;

    if (this.billboardCollectionLength() === (this.points.length + 1)) {
      this.removeLastBillboard();
    }
  }

  private drawSelectedPoint = () => {
    for (let index = 0; index < this.billboardCollectionLength(); index++) {
      const billboard = this.billboardCollection.get(index);

      if (index === this.selectedPoint) {
        billboard.color = Cesium.Color.CHARTREUSE;
        billboard.scale = 1.5;
      } else {
        billboard.color = Cesium.Color.WHITE;
        billboard.scale = 1.0;
      }
    }
  }

  private handleMouseCursor(position: any) {
    const mouseoverFeature = this.scene.pick(position);
    const mouseoverIndex = (mouseoverFeature !== undefined) ?
      this.indexOfBillboard(mouseoverFeature.primitive) : -1;
    if (mouseoverIndex >= 0) {
      CesiumUtils.setCursorCrosshair();
    } else {
      CesiumUtils.unsetCursorCrosshair();
    }
  }

  private updateLonLatLabel(point: ICartesian3 | null) {
    try {
      if (point) {
        const ll = this.cartesianPositionToLonLatDegrees(point);
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

  private stateTransition = (event: PolygonEvent, position: any) => {
    // if (event !== PolygonEvent.moveMouse) {
    // console.log("state=" + this.state + " event=" + event);
    // }
    switch (this.state) {
      case PolygonState.drawingPolygon:
        switch (event) {
          case PolygonEvent.leftClick:
            // Add a new point to the polygon, keep drawing
            this.addPoint(position);
            this.clearMousePoint();
            this.interactionRender();
            break;
          case PolygonEvent.moveMouse:
            this.updateMousePoint(position);
            this.updateLonLatLabel(this.mousePoint);
            this.interactionRender();
            break;
          case PolygonEvent.doubleClick:
            this.state = PolygonState.donePolygon;
            if (this.points.length >= MIN_VERTICES) {
              this.clearMousePoint();
              this.selectedPoint = -1;
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
            if (this.points.length === 0) { break; }
            const pickedFeature = this.scene.pick(position);
            const index = (pickedFeature !== undefined) ?
              this.indexOfBillboard(pickedFeature.primitive) : -1;
            if (index >= 0) {
              // We clicked on one of the polygon points
              this.state = PolygonState.pointSelected;
              this.selectedPoint = index;
              this.updateLonLatLabel(this.points[this.selectedPoint]);
              this.lonLatEnableCallback(true);
              this.interactionRender();
            }
            break;
          case PolygonEvent.moveMouse:
            this.handleMouseCursor(position);
            const point = this.screenPositionToPoint(position);
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
            if (this.points.length === 0) { break; }
            const pickedFeature = this.scene.pick(position);
            const index = (pickedFeature !== undefined) ?
              this.indexOfBillboard(pickedFeature.primitive) : -1;
            if (index < 0) {
              // We clicked somewhere else, not on a point
              this.state = PolygonState.donePolygon;
              this.lonLatEnableCallback(false);
              this.selectedPoint = -1;
              this.interactionRender();
              break;
            }
            if (this.selectedPoint !== index) {
              // We clicked on a new point, so select it instead
              this.selectedPoint = index;
              this.updateLonLatLabel(this.points[this.selectedPoint]);
              this.interactionRender();
              break;
            }
            // We clicked on the selected point
            this.state = PolygonState.movePoint;
            this.lonLatEnableCallback(false);
            CesiumUtils.setCursorCrosshair();
            // Remove the selected point from the stored list,
            // we will instead treat it as the "mouse point".
            this.removeBillboard(index);
            this.points.splice(index, 1);
            this.updateMousePoint(position);
            this.interactionRender();
            break;
          case PolygonEvent.moveMouse:
            this.handleMouseCursor(position);
            break;
          case PolygonEvent.doubleClick:
            // nop
            break;
          case PolygonEvent.lonLatTextChange:
            // We used the edit box to change the coordinates.
            // Note: The "position" here is actually the cartesian3 point.
            // If point already exists, refuse to change the position.
            if (this.isDuplicatePoint(position)) {
              this.updateLonLatLabel(this.points[this.selectedPoint]);
              break;
            }
            this.removeBillboard(this.selectedPoint);
            this.points.splice(this.selectedPoint, 1);
            this.points.push(position);
            this.addBillboard(position);
            // Our selected point will now be at the end of the list
            this.selectedPoint = this.billboardCollectionLength() - 1;
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
            this.addPoint(position);
            this.clearMousePoint();
            this.updateLonLatLabel(this.points[this.selectedPoint]);
            this.lonLatEnableCallback(true);
            this.finishedDrawingCallback(this.points);
            break;
          case PolygonEvent.moveMouse:
            this.updateMousePoint(position);
            this.updateLonLatLabel(this.mousePoint);
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

  private onLeftClick = ({position}: any) => {
    this.stateTransition(PolygonEvent.leftClick, position);
  }

  private onLeftDoubleClick = ({position}: any) => {
    this.stateTransition(PolygonEvent.doubleClick, position);
  }

  private onMouseMove = ({endPosition}: any) => {
    this.stateTransition(PolygonEvent.moveMouse, endPosition);
  }
}
