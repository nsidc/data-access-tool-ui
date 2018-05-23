import { Extent } from "./Extent";

import { ILatLon } from "../LatLon";
import { ISpatialSelection } from "../SpatialSelection";

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
    handler.setInputAction(this.handleLeftClick.bind(this), Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.setInputAction(this.handleMouseMove.bind(this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    this.extent = this.extentFromSpatialSelection(spatialSelection);
    this.showSpatialSelection();
  }

  public updateSpatialSelection(s: ISpatialSelection) {
    this.extent = this.extentFromSpatialSelection(s);
    this.showSpatialSelection();
  }

  public handleSelectionStart() {
    this.extent = new Extent();
    this.extentSelectionInProgress = true;
  }

  public cesiumPositionToLatLon(position: any): ILatLon {
    const cartesian = this.viewer.scene.camera.pickEllipsoid(position, CesiumAdapter.ellipsoid);

    // this means the position is not on the globe
    if (cartesian === undefined) {
      return {lat: NaN, lon: NaN};
    }

    const carto = Cesium.Cartographic.fromCartesian(cartesian);

    const latlon = {
      lat: Number.parseFloat(Cesium.Math.toDegrees(carto.latitude).toFixed(2)),
      lon: Number.parseFloat(Cesium.Math.toDegrees(carto.longitude).toFixed(2)),
    };

    return latlon;
  }

  private showSpatialSelection() {
    if (!this.extent.global() && this.viewer.scene) {
      const entity = this.viewer.entities.getById("extent");

      const rectangle = {
        coordinates: Cesium.Rectangle.fromDegrees(...this.extent.degreesArr()),
        material: CesiumAdapter.extentColor,
      };

      if (!entity) {
        this.viewer.entities.add({
          id: "extent",
          name: "extent",
          rectangle,
        });
      } else {
        entity.rectangle = rectangle;
      }
    }
  }

  private handleLeftClick({position}: any) {
    const latLon = this.cesiumPositionToLatLon(position);
    if (this.latLonIsNaN(latLon)) { return; }

    const selectionInactive = !this.extentSelectionInProgress;
    if (selectionInactive) { return; }

    const startingExtentSelection = !this.extent.startLatLon;
    const endingExtentSelection = this.extent.startLatLon;

    if (startingExtentSelection) {
      this.extent.startLatLon = latLon;

    } else if (endingExtentSelection) {
      this.extent.endLatLon = latLon;

      this.extentSelectionInProgress = false;
      this.handleExtentSelected(this.extent.asSpatialSelection());
    }
  }

  private handleMouseMove({endPosition}: any) {
    const latLon = this.cesiumPositionToLatLon(endPosition);
    if (this.latLonIsNaN(latLon)) { return; }

    const selectionInactive = !this.extentSelectionInProgress;
    if (selectionInactive) { return; }

    if (this.extent.startLatLon) {
      this.extent.endLatLon = latLon;
      this.showSpatialSelection();
    }
  }

  private latLonIsNaN(latLon: ILatLon) {
    return Number.isNaN(latLon.lat) || Number.isNaN(latLon.lon);
  }

  private extentFromSpatialSelection(spatialSelection: ISpatialSelection): Extent {
    if (!spatialSelection) {
      return new Extent();
    }

    return new Extent(
      {lon: spatialSelection.lower_left_lon, lat: spatialSelection.lower_left_lat},
      {lon: spatialSelection.upper_right_lon, lat: spatialSelection.upper_right_lat},
    );
  }
}
