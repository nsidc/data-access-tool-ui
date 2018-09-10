import * as dragImg from "../img/dragIcon.png";
import { CesiumUtils } from "./CesiumUtils";

/* tslint:disable:no-var-requires */
const Cesium = require("cesium/Cesium");
/* tslint:enable:no-var-requires */

interface ILonLat {
  readonly lat: number;
  readonly lon: number;
}

interface IPoint {
  cartesianXYZ: any;
  screenPosition: any;
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
}

export class PolygonMode {

  private billboards: any[] = [];
  private billboardCollection: any;
  private ellipsoid: any;
  private finishedDrawingCallback: any;
  private latLonEnableCallback: (s: boolean) => void;
  private latLonLabelCallback: (s: string) => void;
  private minPoints = 3;
  private mouseHandler: any;
  private mousePoint: IPoint | null = null;
  private points: IPoint[] = [];
  private polygon: any;
  private scene: any;
  private selectedPoint: number = -1;
  private state: PolygonState = PolygonState.drawingPolygon;

  public constructor(scene: any, latLonEnableCallback: (s: boolean) => void,
                     latLonLabelCallback: (s: string) => void,
                     ellipsoid: any, finishedDrawingCallback: any) {
    this.scene = scene;
    this.latLonEnableCallback = latLonEnableCallback;
    this.latLonLabelCallback = latLonLabelCallback;
    this.ellipsoid = ellipsoid;
    this.finishedDrawingCallback = finishedDrawingCallback;
  }

  public start = () => {
    this.reset();
    if (!this.mouseHandler) {
      this.mouseHandler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);

      this.mouseHandler.setInputAction(this.onLeftClick,
                                      Cesium.ScreenSpaceEventType.LEFT_CLICK);

      this.mouseHandler.setInputAction(this.onLeftDoubleClick,
                                      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

      this.mouseHandler.setInputAction(this.onMouseMove,
                                      Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    this.billboardCollection = this.scene.primitives.add(new Cesium.BillboardCollection());
  }

  public reset = () => {
    this.selectedPoint = -1;
    this.points = [];
    this.clearAllBillboards();
    this.clearMousePoint();
    this.finishedDrawingCallback(this.points);
    this.state = PolygonState.drawingPolygon;
    if (this.mouseHandler && !this.mouseHandler.isDestroyed()) {
      this.mouseHandler.destroy();
      this.mouseHandler = null;
    }
  }

  // cartesianXYZ: 3D coordinates for position on earth's surface
  // https://en.wikipedia.org/wiki/ECEF
  public cartesianPositionToLonLatDegrees(cartesianXYZ: any): ILonLat {
    // this means the position is not on the globe
    if (cartesianXYZ === undefined) {
      return {lat: NaN, lon: NaN};
    }

    const cartographicRadians = Cesium.Cartographic.fromCartesian(cartesianXYZ);

    const latLonDegrees = {
      lat: Number.parseFloat(Cesium.Math.toDegrees(cartographicRadians.latitude)),
      lon: Number.parseFloat(Cesium.Math.toDegrees(cartographicRadians.longitude)),
    };

    return latLonDegrees;
  }

  public changeLatLon(latLon: string) {
    console.log(latLon);
  }

  // To avoid bow-ties if the user draws the points in a strange order,
  // reorder the points to ensure that they form a counterclockwise
  // non-overlapping polygon.
  // To reorder, convert points to 2D, compute the angle between each point
  // and the center of the bounding box for all the points. Then sort
  // the angles into ascending order.
  // Returns an array of indices that sort points into correct order.
  // For algorithm see https://stackoverflow.com/questions/19713092/
  private sortedPolygonPointIndices(points: IPoint[]): number[] {

    // Convert all points from 3D to 2D, save the original points.
    // Compute the bounding box for all the points.
    let lonLatsArray = points.map((point: IPoint, index) => {
      const latLon = this.cartesianPositionToLonLatDegrees(point.cartesianXYZ);
      return {index, ...latLon};
    });

    const minLat = Math.min.apply(null, lonLatsArray.map((p) => p.lat));
    const maxLat = Math.max.apply(null, lonLatsArray.map((p) => p.lat));
    const minLon = Math.min.apply(null, lonLatsArray.map((p) => p.lon));
    const maxLon = Math.max.apply(null, lonLatsArray.map((p) => p.lon));

    const center = {lat: 0.5 * (minLat + maxLat),
      lon: 0.5 * (minLon + maxLon)};
    const last = lonLatsArray[lonLatsArray.length - 1];
    const angleLast = Math.atan2(last.lat - center.lat, last.lon - center.lon);

    lonLatsArray = lonLatsArray.map((lonlat) => {
      let angle = Math.atan2(lonlat.lat - center.lat, lonlat.lon - center.lon);
      // Rotate (shift) all of the points that come before the last point
      // to the end of the array. The <= ensures that the last point comes
      // at the very end, since that is the mousePoint and will need to be
      // stripped off the end before storing.
      if (angle <= angleLast) {
        angle += 2 * Math.PI;
      }
      return {...lonlat, angle};
    });

    // Sort the points in counter-clockwise order using the 2D angles
    lonLatsArray.sort((a: any, b: any) => (a.angle - b.angle));

    // Strip out the indices that will sort the array
    const indices = lonLatsArray.map((lonlat) => lonlat.index);
    return indices;
  }

  private render = () => {
    // gather all the points; rendering doesn't care about the distinction
    // between clicked points and the point following the cursor
    const origPoints = (this.mousePoint !== null) ?
      this.points.concat([this.mousePoint]) : this.points.slice();

    // if we meet the minimum points requirement, render the polygon
    if (origPoints.length >= this.minPoints) {

      // Ensure that the points are in counterclockwise non-overlapping order.
      const indices = this.sortedPolygonPointIndices(origPoints);

      this.points = [];
      const billboards: any[] = [];
      indices.forEach((index) => {
        this.points.push(origPoints[index]);
        billboards.push(this.billboards[index]);
      });

      this.billboards = billboards;

      // For rendering, make a copy of our reordered points
      const points = this.points.slice();

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
        positions: points.map((p) => p.cartesianXYZ),
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

    this.drawSelectedPoint();
  }

  private screenPositionToPoint = (position: any): IPoint | null => {
    if (position === null) { return null; }

    const cartesian = this.scene.camera.pickEllipsoid(position, this.ellipsoid);
    if (!cartesian) { return null; }

    const point = {
      cartesianXYZ: cartesian,
      screenPosition: position.clone(),
    };

    return point;
  }

  private addPoint = (position: any) => {
    const point = this.screenPositionToPoint(position);
    if (point === null) { return; }

    this.points.push(point);
    this.addBillboard(point);
  }

  private popPoint = () => {
    this.points.pop();
    this.removeLastBillboard();
  }

  private addBillboard = (point: IPoint) => {
    const billboard = this.billboardCollection.add({
      image: dragImg,
      position: point.cartesianXYZ,
    });
    this.billboards.push(billboard);
  }

  private removeLastBillboard = () => {
    const billboard = this.billboards.pop();
    this.billboardCollection.remove(billboard);
  }

  private clearAllBillboards = () => {
    this.billboards.forEach((b) => this.billboardCollection.remove(b));
    this.billboards = [];
  }

  private updateMousePoint = (position: any) => {
    const point = this.screenPositionToPoint(position);
    if (point === null) { return; }

    this.clearMousePoint();
    this.mousePoint = point;
    this.addBillboard(point);

    // Our selected point will now be at the end of the list
    this.selectedPoint = this.billboards.length - 1;
  }

  private clearMousePoint = () => {
    this.mousePoint = null;

    if (this.billboards.length === (this.points.length + 1)) {
      this.removeLastBillboard();
    }
  }

  private drawSelectedPoint = () => {
    this.billboards.forEach((b) => {
      b.color = Cesium.Color.WHITE;
      b.scale = 1.0;
    });
    if (this.selectedPoint >= 0 && this.selectedPoint < this.billboards.length) {
      this.billboards[this.selectedPoint].color = Cesium.Color.CHARTREUSE;
      this.billboards[this.selectedPoint].scale = 1.5;
    }
  }

  private handleMouseCursor(position: any) {
    const mouseoverFeature = this.scene.pick(position);
    const mouseoverIndex = (mouseoverFeature !== undefined) ?
      this.billboards.indexOf(mouseoverFeature.primitive) : -1;
    if (mouseoverIndex >= 0) {
      CesiumUtils.setCursorCrosshair();
    } else {
      CesiumUtils.unsetCursorCrosshair();
    }
  }

  private updateLatLonLabel(point: IPoint | null) {
    try {
      if (point) {
        const ll = this.cartesianPositionToLonLatDegrees(point.cartesianXYZ);
        const lat1 = Math.round(ll.lat * 100) / 100;
        const lat = "" + Math.abs(lat1) + ((lat1 > 0) ? "N" : "S");
        const lon1 = Math.round(ll.lon * 100) / 100;
        const lon = "" + Math.abs(lon1) + ((lon1 > 0) ? "E" : "W");
        this.latLonLabelCallback(lat + ", " + lon);
      } else {
        this.latLonLabelCallback("");
      }
    } catch (error) {
      this.latLonLabelCallback("---");
    }
  }

  // States
  // DrawingPolygon
  //   leftClick: Add new point (transfer mouse point)
  //   moveMouse: Move current mouse point
  //   doubleClick: End polygon, CALLBACK, --> DonePolygon
  // DonePolygon
  //   leftClick: If on point, select point --> PointSelected
  //   moveMouse: Check mouse cursor
  //   doubleClick: nop
  // PointSelected
  //   leftClick: If not on point, deselect point --> DonePolygon
  //              If different point, select it
  //              If on point, transfer to mouse point --> MovePoint
  //   moveMouse: Check mouse cursor
  //   doubleClick: nop
  // MovePoint
  //   leftClick: Add new point (transfer mouse point), CALLBACK, --> PointSelected
  //   moveMouse: Move current mouse point
  //   doubleClick: nop

  private stateTransition = (event: PolygonEvent, position: any) => {
//    if (event !== PolygonEvent.moveMouse) {
//      console.log("state=" + this.state + " event=" + event);
//    }
    switch (this.state) {
      case PolygonState.drawingPolygon:
        switch (event) {
          case PolygonEvent.leftClick:
            // Add a new point to the polygon, keep drawing
            this.addPoint(position);
            this.clearMousePoint();
            this.render();
            break;
          case PolygonEvent.moveMouse:
            this.updateMousePoint(position);
            this.updateLatLonLabel(this.mousePoint);
            this.render();
            break;
          case PolygonEvent.doubleClick:
            this.state = PolygonState.donePolygon;
            // two individual left click events fire before the double click does; this
            // results in a duplicate of the final position at the end of
            // `this.points` that can (and should) be safely removed
            this.popPoint();
            if (this.points.length >= this.minPoints) {
              this.clearMousePoint();
              this.selectedPoint = -1;
              this.render();
              this.finishedDrawingCallback(this.points);
            }
            break;
        }
        break;

      case PolygonState.donePolygon:
        switch (event) {
          case PolygonEvent.leftClick:
            if (this.points.length === 0) { break; }
            const pickedFeature = this.scene.pick(position);
            const index = (pickedFeature !== undefined) ?
              this.billboards.indexOf(pickedFeature.primitive) : -1;
            if (index >= 0) {
              // We clicked on one of the polygon points
              this.state = PolygonState.pointSelected;
              this.selectedPoint = index;
              this.updateLatLonLabel(this.points[this.selectedPoint]);
              this.latLonEnableCallback(true);
              this.render();
            }
            break;
          case PolygonEvent.moveMouse:
            this.handleMouseCursor(position);
            const point = this.screenPositionToPoint(position);
            this.updateLatLonLabel(point);
            break;
          case PolygonEvent.doubleClick:
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
              this.billboards.indexOf(pickedFeature.primitive) : -1;
            if (index < 0) {
              // We clicked somewhere else, not on a point
              this.state = PolygonState.donePolygon;
              this.latLonEnableCallback(false);
              this.selectedPoint = -1;
              this.render();
              break;
            }
            if (this.selectedPoint !== index) {
              // We clicked on a new point, so select it instead
              this.selectedPoint = index;
              this.updateLatLonLabel(this.points[this.selectedPoint]);
              this.render();
              break;
            }
            // We clicked on the selected point
            this.state = PolygonState.movePoint;
            this.latLonEnableCallback(false);
            CesiumUtils.setCursorCrosshair();
            // Remove the selected point from the stored list,
            // we will instead treat it as the "mouse point".
            this.billboardCollection.remove(this.billboards[index]);
            this.billboards.splice(index, 1);
            this.points.splice(index, 1);
            this.updateMousePoint(position);
            this.render();
            break;
          case PolygonEvent.moveMouse:
            this.handleMouseCursor(position);
            break;
          case PolygonEvent.doubleClick:
            // nop
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
            this.updateLatLonLabel(this.points[this.selectedPoint]);
            this.latLonEnableCallback(true);
            this.finishedDrawingCallback(this.points);
            break;
          case PolygonEvent.moveMouse:
            this.updateMousePoint(position);
            this.updateLatLonLabel(this.mousePoint);
            this.render();
            break;
          case PolygonEvent.doubleClick:
            // nop - this allows doubleClick to immediately select and start moving a point
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
