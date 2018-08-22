import * as dragImg from "../img/dragIcon.png";

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

export class PolygonMode {

  private billboards: any[] = [];
  private billboardCollection: any;
  private ellipsoid: any;
  private finishedDrawingCallback: any;
  private minPoints = 3;
  private mouseHandler: any;
  private mousePoint: IPoint | null = null;
  private points: IPoint[] = [];
  private polygon: any;
  private scene: any;
  private finishedDrawing = false;

  public constructor(scene: any, ellipsoid: any, finishedDrawingCallback: any) {
    this.scene = scene;
    this.ellipsoid = ellipsoid;
    this.finishedDrawingCallback = finishedDrawingCallback;
  }

  public start = () => {
    this.reset();
    this.mouseHandler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);

    this.mouseHandler.setInputAction(this.onLeftClick,
                                     Cesium.ScreenSpaceEventType.LEFT_CLICK);

    this.mouseHandler.setInputAction(this.onLeftDoubleClick,
                                     Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    this.mouseHandler.setInputAction(this.onMouseMove,
                                     Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    this.billboardCollection = this.scene.primitives.add(new Cesium.BillboardCollection());
  }

  public endMode = () => {
    this.clearMousePoint();
    this.finishedDrawing = true;
    if (this.mouseHandler && !this.mouseHandler.isDestroyed()) {
//      this.mouseHandler.destroy();
    }
    this.finishedDrawingCallback(this.points);
  }

  public reset = () => {
    this.points = [];
    this.clearAllBillboards();
    this.endMode();
    this.finishedDrawing = false;
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

  // To avoid bow-ties if the user draws the points in a strange order,
  // reorder the points to ensure that they form a counterclockwise
  // non-overlapping polygon.
  // To reorder, convert points to 2D, compute the angle between each point
  // and the center of the bounding box for all the points. Then sort
  // the angles into ascending order.
  // For algorithm see https://stackoverflow.com/questions/19713092/
  private reorderPolygonPoints(points: IPoint[]): IPoint[] {

    // Convert all points from 3D to 2D, save the original points.
    // Compute the bounding box for all the points.
    let lonLatsArray = points.map((point: IPoint) => {
      const latLon = this.cartesianPositionToLonLatDegrees(point.cartesianXYZ);
      return {point, ...latLon};
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

    // Strip out just our original points, now in sorted order
    points = lonLatsArray.map((lonlat) => lonlat.point);
    return points;
  }

  private render = () => {
    // gather all the points; rendering doesn't care about the distinction
    // between clicked points and the point following the cursor
    let points = (this.mousePoint !== null) ?
      this.points.concat([this.mousePoint]) : this.points.slice();

    // if we meet the minimum points requirement, render the polygon
    if (points.length >= this.minPoints) {

      // Ensure that the points are in counterclockwise non-overlapping order.
      points = this.reorderPolygonPoints(points);

      // Stash a copy of our reordered points. Needs to be a copy because
      // we muck with the points below when we render the polygon.
      this.points = points.slice();
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
  }

  private clearMousePoint = () => {
    this.mousePoint = null;

    if (this.billboards.length === (this.points.length + 1)) {
      this.removeLastBillboard();
    }
  }

  private onLeftClick = ({position}: any) => {
    if (this.finishedDrawing) {
      if (this.points.length > 0) {
        const pickedFeature = this.scene.pick(position);
        if (pickedFeature === undefined) { return; }
        const index = this.billboards.indexOf(pickedFeature.primitive);
        if (index >= 0) {
          const point = this.screenPositionToPoint(position);
          if (point === null) { return; }
        }
      }
      return;
    }
    this.addPoint(position);
    this.clearMousePoint();
    this.render();
  }

  private onLeftDoubleClick = ({position}: any) => {
    if (this.finishedDrawing) {
      return;
    }
    // two individual left click events fire before the double click does; this
    // results in a duplicate of the final position at the end of
    // `this.points` that can (and should) be safely removed
    this.popPoint();

    if (this.points.length >= this.minPoints) {
      this.clearMousePoint();
      this.render();
      this.endMode();
    }
  }

  private onMouseMove = ({endPosition}: any) => {
    if (this.finishedDrawing) {
      return;
    }
    this.updateMousePoint(endPosition);
    this.render();
  }
}
