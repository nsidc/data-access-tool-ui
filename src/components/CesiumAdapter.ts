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
  private static extentColor = new Cesium.Color(0.0, 1.0, 1.0, 0.5);
  private static ellipsoid = Cesium.Ellipsoid.WGS84;

  private viewer: any;
  private extent: IExtent;
  private extentSelectionInProgress: boolean;
  private handleExtentSelected: (s: ISpatialSelection) => void;

  constructor(extentSelected: (s: ISpatialSelection) => void) {
    this.extentSelectionInProgress = false;
    this.handleExtentSelected = extentSelected;
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

    this.extent = this.rectangleFromSpatialSelection(spatialSelection);
    this.showSpatialSelection();
  }

  public updateSpatialSelection(s: ISpatialSelection) {
    this.extent = this.rectangleFromSpatialSelection(s);
    this.showSpatialSelection();
  }

  public handleReset() {
    this.viewer.entities.removeAll();
    this.extent = { a: null, b: null };
  }

  public handleSelectionStart() {
    this.extent = { a: null, b: null };
    this.extentSelectionInProgress = true;
  }

  private showSpatialSelection() {
    if (this.extent.a && this.extent.b && this.viewer.scene) {
      const entity = this.viewer.entities.getById("extent");
      if (!entity) {
        this.viewer.entities.add({
          id: "extent",
          name: "extent",
          rectangle: {
            coordinates: Cesium.Rectangle.fromCartesianArray([this.extent.a, this.extent.b]),
            material: CesiumAdapter.extentColor,
          },
        });
      } else {
        entity.rectangle = {
          coordinates: Cesium.Rectangle.fromCartesianArray([this.extent.a, this.extent.b]),
          material: CesiumAdapter.extentColor,
        };
      }
    }
  }

  private handleLeftClick(name: string, position: any) {
    if (!this.extentSelectionInProgress) {
      console.log("Globe clicked, not currently selecting extent.");
      return;
    }

    this.savePosition(position);
    this.showSpatialSelection();

    if (this.extentSelectionInProgress && this.extent.a && this.extent.b) {
      this.extentSelectionInProgress = false;
      this.handleExtentSelected(this.spatialSelectionToDegrees());
    }
  }

  private handleMouseMove(event: any) {
    if (this.extentSelectionInProgress && this.extent.a) {
      this.savePosition(event.endPosition);
      this.showSpatialSelection();
    }
  }

  private savePosition(position: any) {
    const cartesian = this.viewer.scene.camera.pickEllipsoid(position, CesiumAdapter.ellipsoid);

    if (cartesian) {
      if (!this.extent.a) {
        this.extent.a = cartesian;
      } else {
        this.extent.b = cartesian;
      }
    }
  }

  private rectangleFromSpatialSelection(spatialSelection: ISpatialSelection): IExtent {
    if (!spatialSelection) {
      return {a: null, b: null };
    }

    const degArray = [
      spatialSelection.lower_left_lon, spatialSelection.lower_left_lat,
      spatialSelection.upper_right_lon, spatialSelection.upper_right_lat,
    ];

    const c3 = Cesium.Cartesian3.fromDegreesArray(degArray);
    return { a: c3[0], b: c3[1] };
  }

  private spatialSelectionToDegrees() {
    const rect = Cesium.Rectangle.fromCartesianArray([this.extent.a, this.extent.b]);
    const ne = this.cartographicToDegrees(Cesium.Rectangle.northeast(rect));
    const sw = this.cartographicToDegrees(Cesium.Rectangle.southwest(rect));

    // I think we need to format the spatial selection using points describing a
    // polygon (counterclockwise direction). See Icebridge Portal handling of
    // spatial selections. The other two points in the polygon are available
    // from the rectangle, like so:
    // const nw = this.cartographicToDegrees(Cesium.Rectangle.northwest(rect));
    // const se = this.cartographicToDegrees(Cesium.Rectangle.southeast(rect));

    return {
      lower_left_lat: sw.lat,
      lower_left_lon: sw.lon,
      upper_right_lat: ne.lat,
      upper_right_lon: ne.lon,
    };
  }

  private cartographicToDegrees(carto: any) {
    return {
      lat: Cesium.Math.toDegrees(carto.latitude),
      lon: Cesium.Math.toDegrees(carto.longitude),
    };
  }
}
