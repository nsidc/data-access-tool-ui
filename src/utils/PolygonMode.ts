import * as dragImg from "../img/dragIcon.png";
import { CesiumUtils } from "./CesiumUtils";

/* tslint:disable:no-var-requires */
const Cesium = require("cesium/Cesium");
/* tslint:enable:no-var-requires */

interface ILatLon {
  readonly lat: number;
  readonly lon: number;
}

interface ICartesian3 {
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
  editPoint,
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
  private mousePoint: ICartesian3 | null = null;
  private points: ICartesian3[] = [];
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

  // point: 3D coordinates for position on earth's surface
  // https://en.wikipedia.org/wiki/ECEF
  public cartesianPositionToLatLonDegrees(point: ICartesian3): ILatLon {
    // this means the position is not on the globe
    if (point === undefined) {
      return {lat: NaN, lon: NaN};
    }

    const cartographicRadians = Cesium.Cartographic.fromCartesian(point);

    const latLonDegrees = {
      lat: Number.parseFloat(Cesium.Math.toDegrees(cartographicRadians.latitude)),
      lon: Number.parseFloat(Cesium.Math.toDegrees(cartographicRadians.longitude)),
    };

    return latLonDegrees;
  }

  // Called by the CesiumAdapter when the lat lon text box gets changed
  public changeLatLon(sLatLon: string) {
    const latLon = this.parseLatLon(sLatLon);
    if (isNaN(latLon.lat) || isNaN(latLon.lon)) {
      return;
    }
    const position = this.latLonToCartesianPosition(latLon);
    this.updateLatLonLabel(position);
    this.stateTransition(PolygonEvent.editPoint, position);
  }

  private parseLatLon(sLatLon: string): ILatLon {
    let s = sLatLon.split(",");
    if (s.length < 2) {
      s = sLatLon.split(" ");
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

  private latLonToCartesianPosition(latLon: ILatLon): ICartesian3 {
    const cart = Cesium.Cartographic.fromDegrees(latLon.lon, latLon.lat);
    const point = Cesium.Cartographic.toCartesian(cart, this.ellipsoid);
    return point;
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
    let latLonsArray = points.map((point: ICartesian3, index) => {
      const latLon = this.cartesianPositionToLatLonDegrees(point);
      return {index, ...latLon};
    });

    const minLat = Math.min.apply(null, latLonsArray.map((p) => p.lat));
    const maxLat = Math.max.apply(null, latLonsArray.map((p) => p.lat));
    const minLon = Math.min.apply(null, latLonsArray.map((p) => p.lon));
    const maxLon = Math.max.apply(null, latLonsArray.map((p) => p.lon));

    const center = {lat: 0.5 * (minLat + maxLat),
      lon: 0.5 * (minLon + maxLon)};
    const last = latLonsArray[latLonsArray.length - 1];
    const angleLast = Math.atan2(last.lat - center.lat, last.lon - center.lon);

    latLonsArray = latLonsArray.map((latLon) => {
      let angle = Math.atan2(latLon.lat - center.lat, latLon.lon - center.lon);
      // Rotate (shift) all of the points that come before the last point
      // to the end of the array. The <= ensures that the last point comes
      // at the very end, since that is the mousePoint and will need to be
      // stripped off the end before storing.
      if (angle <= angleLast) {
        angle += 2 * Math.PI;
      }
      return {...latLon, angle};
    });

    // Sort the points in counter-clockwise order using the 2D angles
    latLonsArray.sort((a: any, b: any) => (a.angle - b.angle));

    // Strip out the indices that will sort the array
    const indices = latLonsArray.map((latLon) => latLon.index);
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
        positions: points,
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

  private screenPositionToPoint = (position: any): ICartesian3 | null => {
    if (position === null) { return null; }

    const cartesian = this.scene.camera.pickEllipsoid(position, this.ellipsoid);
    if (!cartesian) { return null; }
    return cartesian;
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

  private addBillboard = (point: ICartesian3) => {
    const billboard = this.billboardCollection.add({
      image: dragImg,
      position: point,
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

  private updateLatLonLabel(point: ICartesian3 | null) {
    try {
      if (point) {
        const ll = this.cartesianPositionToLatLonDegrees(point);
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
  //   editPoint: nop
  // DonePolygon
  //   leftClick: If on point, select point --> PointSelected
  //   moveMouse: Check mouse cursor
  //   doubleClick: nop
  //   editPoint: nop
  // PointSelected
  //   leftClick: If not on point, deselect point --> DonePolygon
  //              If different point, select it
  //              If on point, transfer to mouse point --> MovePoint
  //   moveMouse: Check mouse cursor
  //   doubleClick: nop
  //   editPoint: Move point to new position, CALLBACK
  // MovePoint
  //   leftClick: Add new point (transfer mouse point), CALLBACK, --> PointSelected
  //   moveMouse: Move current mouse point
  //   doubleClick: nop
  //   editPoint: nop

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
          case PolygonEvent.editPoint:
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
          case PolygonEvent.editPoint:
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
          case PolygonEvent.editPoint:
            // We used the edit box to change the coordinates.
            // Note: The "position" here is actually the cartesian3 point.
            this.billboardCollection.remove(this.billboards[this.selectedPoint]);
            this.billboards.splice(this.selectedPoint, 1);
            this.points.splice(this.selectedPoint, 1);
            this.points.push(position);
            this.addBillboard(position);
            // Our selected point will now be at the end of the list
            this.selectedPoint = this.billboards.length - 1;
            this.render();
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
          case PolygonEvent.editPoint:
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
