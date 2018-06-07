/* tslint:disable:no-var-requires */
const Cesium = require("cesium/Cesium");
/* tslint:enable:no-var-requires */

export class PolygonMode {

  private finishedDrawingCallback: any;
  private ellipsoid: any;
  private minPoints = 3;
  private mouseHandler: any;
  private polygon: any;
  private positions: any[] = [];
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
    this.mouseHandler.destroy();
    this.finishedDrawingCallback(this.positions);
  }

  private render() {
    if (this.positions.length >= this.minPoints) {
      if (this.polygon) {
        this.scene.primitives.remove(this.polygon);
        Cesium.destroyObject(this.polygon);
      }

      const appearance = new Cesium.EllipsoidSurfaceAppearance({
        aboveGround: false,
      });

      const geometry = Cesium.PolygonGeometry.fromPositions({
        ellipsoid: this.ellipsoid,
        positions: this.positions,
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

  // add points with each left click
  @eventObjectToVerifiedCartesianArg("position")
  private onLeftClick(cartesian: any) {
    // remove "temporary" point from mouse movement if one exists; if
    // `this.positions` is empty this is a no-op
    this.positions.pop();

    // add permanent point
    this.positions.push(cartesian);

    // add "temporary" point that will move with the mouse
    this.positions.push(cartesian.clone());
  }

  // stop drawing with left double click
  @eventObjectToVerifiedCartesianArg("position")
  private onLeftDoubleClick(cartesian: any) {
    // two individual left click events fire before the double click does; this
    // results in 2 duplicates of the final position at the end of
    // `this.positions` that can be safely removed
    this.positions = this.positions.slice(0, -2);

    // if we don't have enough points to complete the polygon, treat the event
    // like a single click; re-add the "temporary" point to keep drawing
    if (this.positions.length < this.minPoints) {
      this.positions.push(cartesian);
      return;
    }

    this.render();
    this.endMode();
  }

  @eventObjectToVerifiedCartesianArg("endPosition")
  private onMouseMove(cartesian: any) {
    if (this.positions.length === 0) { return; }

    // remove and update "temporary" position
    this.positions.pop();
    this.positions.push(cartesian);

    this.render();
  }
}

// Decorator to simplify definitions for cesium event handlers in this module;
// the given XY position is converted to cartesian coordinates and passed on to
// the decorated function; if the position is null or the calculated cartesian
// position is off the globe, the decorated function is skipped.
//
// Arguments:
// positionKey - the key in the object passed by the fired cesium event object
//               that contains the position relevant for the decorated function
function eventObjectToVerifiedCartesianArg(positionKey: string = "position") {
  return (target: any, name: string, descriptor: any) => {
    const original = descriptor.value;

    descriptor.value = function(...args: any[]) {
      const index = 0;

      const position = args[index][positionKey];
      if (position === null) { return; }

      const cartesian = this.scene.camera.pickEllipsoid(position, this.ellipsoid);
      if (!cartesian) { return; }

      const newArgs = args.slice();
      newArgs[index] = cartesian;

      return original.apply(this, newArgs);
    };

    return descriptor;
  };
}
