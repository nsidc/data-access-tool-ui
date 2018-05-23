import { ISpatialSelection } from "../SpatialSelection";

import { Extent } from "./Extent";

/* tslint:disable:no-var-requires */
const Cesium = require("cesium/Cesium");
require("cesium/Widgets/widgets.css");
/* tslint:enable:no-var-requires */

export class CesiumAdapter {
  private static extentColor = new Cesium.Color(0.0, 1.0, 1.0, 0.5);
  private static ellipsoid = Cesium.Ellipsoid.WGS84;

  private viewer: any;
  private extent: Extent;
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
      creditContainer: "credit",
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

    this.extent = this.extentFromSpatialSelection(spatialSelection);
    this.showSpatialSelection();
  }

  public updateSpatialSelection(s: ISpatialSelection) {
    console.log(s);
    this.extent = this.extentFromSpatialSelection(s);
    console.log(this.extent);
    this.showSpatialSelection();
  }

  public handleSelectionStart() {
    this.extent = new Extent();
    this.extentSelectionInProgress = true;
  }

  private showSpatialSelection() {
    if (this.extent.valid() && this.viewer.scene) {
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
      this.handleExtentSelected(this.spatialSelectionFromExtent(this.extent));
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

  private extentFromSpatialSelection(spatialSelection: ISpatialSelection): Extent {
    if (!spatialSelection) {
      return new Extent();
    }

    const degArray = [
      spatialSelection.lower_left_lon, spatialSelection.lower_left_lat,
      spatialSelection.upper_right_lon, spatialSelection.upper_right_lat,
    ];

    const c3 = Cesium.Cartesian3.fromDegreesArray(degArray);
    return new Extent(c3[0], c3[1]);
  }

  private spatialSelectionFromExtent(e: Extent): ISpatialSelection {
    if (!e || !e.valid()) {
      console.log("Returning default globe settings");
      return {
        lower_left_lat: -90,
        lower_left_lon: -180,
        upper_right_lat: 90,
        upper_right_lon: 180,
      };
    }

    const rect = Cesium.Rectangle.fromCartesianArray([e.a, e.b]);
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
      lat: Number.parseFloat(Cesium.Math.toDegrees(carto.latitude).toFixed(2)),
      lon: Number.parseFloat(Cesium.Math.toDegrees(carto.longitude).toFixed(2)),
    };
  }
}
