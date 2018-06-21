import * as dragImg from "../img/dragIcon.png";

/* tslint:disable:no-var-requires */
const Cesium = require("cesium/Cesium");
/* tslint:enable:no-var-requires */

export class PolygonMode {

  private billboards: any[] = [];
  private billboardCollection: any;
  private ellipsoid: any;
  private finishedDrawingCallback: any;
  private minPoints = 3;
  private mouseHandler: any;
  private mousePoint: any = null;
  private points: any[] = [];
  private polygon: any;
  private scene: any;

  public constructor(scene: any, ellipsoid: any, finishedDrawingCallback: any) {
    this.scene = scene;
    this.ellipsoid = ellipsoid;
    this.finishedDrawingCallback = finishedDrawingCallback;
  }

  public start() {
    this.mouseHandler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);

    this.mouseHandler.setInputAction(this.onLeftClick.bind(this),
                                     Cesium.ScreenSpaceEventType.LEFT_CLICK);

    this.mouseHandler.setInputAction(this.onLeftDoubleClick.bind(this),
                                     Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    this.mouseHandler.setInputAction(this.onMouseMove.bind(this),
                                     Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    this.billboardCollection = this.scene.primitives.add(new Cesium.BillboardCollection());
  }

  public endMode() {
    this.clearMousePoint();
    this.mouseHandler.destroy();
    this.finishedDrawingCallback(this.points);
  }

  private render() {
    // gather all the points; rendering doesn't care about the distinction
    // between clicked points and the point following the cursor
    let points = this.points;
    if (this.mousePoint !== null) {
      points = points.concat([this.mousePoint]);
    }
    points = points.map((p) => p.cartesianXYZ);

    // if we meet the minimum points requirement, render the polygon
    if (points.length >= this.minPoints) {
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

    // if exactly one point has been set, render a line between that point and
    // the current mouse point
  }

  private screenPositionToPoint(position: any) {
    if (position === null) { return null; }

    const cartesian = this.scene.camera.pickEllipsoid(position, this.ellipsoid);
    if (!cartesian) { return null; }

    const point = {
      cartesianXYZ: cartesian,
      screenPosition: position.clone(),
    };

    return point;
  }

  private addPoint(position: any) {
    const point = this.screenPositionToPoint(position);
    if (point === null) { return; }

    this.points.push(point);
    this.addBillboard(point);
  }

  private popPoint() {
    this.points.pop();
    this.removeLastBillboard();
  }

  private addBillboard(point: any) {
    const billboard = this.billboardCollection.add({
      image: dragImg,
      position: point.cartesianXYZ,
    });
    this.billboards.push(billboard);
  }

  private removeLastBillboard() {
    const billboard = this.billboards.pop();
    this.billboardCollection.remove(billboard);
  }

  private updateMousePoint(position: any) {
    const point = this.screenPositionToPoint(position);
    if (point === null) { return; }

    this.clearMousePoint();
    this.mousePoint = point;
    this.addBillboard(point);
  }

  private clearMousePoint() {
    this.mousePoint = null;

    if (this.billboards.length === (this.points.length + 1)) {
      this.removeLastBillboard();
    }
  }

  private onLeftClick({position}: any) {
    this.addPoint(position);
    this.clearMousePoint();
    this.render();
  }

  private onLeftDoubleClick({position}: any) {
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

  private onMouseMove({endPosition}: any) {
    this.updateMousePoint(endPosition);
    this.render();
  }
}
