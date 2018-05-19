import { ISpatialSelection } from "../SpatialSelection";

/* tslint:disable:no-var-requires */
const Cesium = require("cesium/Cesium");
require("cesium/Widgets/widgets.css");
/* tslint:enable:no-var-requires */

interface IExtent {
  a: any;
  b: any;
}

export class CesiumAdapter {
  private viewer: any;
  private extent: IExtent;
  private defaultShapeOptions: any;
  private extentSelectionInProgress: boolean;
  private spatialSelection: ISpatialSelection;
  private handleExtentSelected: (s: ISpatialSelection) => void;

  constructor(extentSelected: (s: ISpatialSelection) => void) {
    this.defaultShapeOptions = {
      appearance: new Cesium.EllipsoidSurfaceAppearance({
        aboveGround: false,
      }),
      asynchronous: true,
      debugShowBoundingVolume: false,
      ellipsoid: Cesium.Ellipsoid.WGS84,
      granularity: Math.PI / 180.0,
      height: 0.0,
      material: Cesium.Material.fromType(Cesium.Material.ColorType),
      show: true,
      textureRotationAngle: 0.0,
    };
    this.extentSelectionInProgress = false;
    this.handleExtentSelected = extentSelected;

    // TODO: Do something with this!
    this.rectangleFromSpatialSelection(this.spatialSelection);
  }

  public createViewer(elementId: string, spatialSelection: ISpatialSelection) {
    this.viewer = new Cesium.Viewer(elementId, {
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      scene3DOnly: true,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
    });

    const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    handler.setInputAction(
      (movement: any) => this.handleLeftClick("leftClick", movement.position),
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
    );

    handler.setInputAction((event: any) => this.handleMouseMove(event),
      Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    this.spatialSelection = spatialSelection;
  }

  public showSpatialSelection() {
    if (this.extent.a && this.extent.b && this.viewer.scene) {
      const entity = this.viewer.entities.getById("extent");
      if (!entity) {
        this.viewer.entities.add({
          id: "extent",
          name: "extent",
          rectangle: {
            coordinates: Cesium.Rectangle.fromCartesianArray([this.extent.a, this.extent.b]),
            material: new Cesium.Color(0.0, 1.0, 1.0, 0.5),
          },
        });
      } else {
        entity.rectangle = {
          coordinates: Cesium.Rectangle.fromCartesianArray([this.extent.a, this.extent.b]),
          material: new Cesium.Color(0.0, 1.0, 1.0, 0.5),
        };
      }
    }
  }

  public handleReset() {
    console.log("Reset spatial selection");

    this.viewer.scene.primitives.removeAll();
    this.extent = { a: null, b: null };
  }

  public handleSelectionStart() {
    console.log("Start drawing extent");

    this.extent = { a: null, b: null };
    this.extentSelectionInProgress = true;
  }

  // Save selected point
  private handleLeftClick(name: string, position: any) {
    if (!this.extentSelectionInProgress) {
      console.log("Globe clicked, not currently selecting extent.");
      return;
    }

    this.savePosition(position);
    this.showSpatialSelection();

    if (this.extentSelectionInProgress && this.extent.a && this.extent.b) {
      this.extentSelectionInProgress = false;
      // TODO: convert our points into a spatial selection!
      this.handleExtentSelected(this.spatialSelection);
    }
  }

  private handleMouseMove(event: any) {
    if (this.extentSelectionInProgress && this.extent.a) {
      this.savePosition(event.endPosition);
      this.showSpatialSelection();
    }
  }

  private savePosition(position: any) {
    const ellipsoid = this.defaultShapeOptions.ellipsoid;
    const cartesian = this.viewer.scene.camera.pickEllipsoid(position, ellipsoid);

    if (cartesian) {
      if (!this.extent.a) {
        console.log("add point a: " + cartesian);
        this.extent.a = cartesian;
      } else {
        console.log("add point b: " + cartesian);
        this.extent.b = cartesian;
      }
    }
  }

  private rectangleFromSpatialSelection(spatialSelection: ISpatialSelection) {
    if (!spatialSelection) {
      return;
    }

    const degArray = [
      spatialSelection.lower_left_lon, spatialSelection.lower_left_lat,
      spatialSelection.upper_right_lon, spatialSelection.upper_right_lat,
    ];
    return Cesium.Cartesian3.fromDegreesArray(degArray);
  }

}
