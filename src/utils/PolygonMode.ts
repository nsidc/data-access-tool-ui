/* tslint:disable:no-var-requires */
const Cesium = require("cesium/Cesium");
/* tslint:enable:no-var-requires */

export class PolygonMode {

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
  }

  public endMode() {
    this.clearMousePoint();
    this.mouseHandler.destroy();
    this.finishedDrawingCallback(this.points);
  }

  private render() {
    let points = this.points;
    if (this.mousePoint !== null) {
      points = points.concat([this.mousePoint]);
    }
    points = points.map((p) => p.cartesianXYZ);

    if (points.length >= this.minPoints) {
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
  }

  private updateMousePoint(position: any) {
    const point = this.screenPositionToPoint(position);
    if (point === null) { return; }

    this.mousePoint = point;
  }

  private clearMousePoint() {
    this.mousePoint = null;
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
    this.points.pop();

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
