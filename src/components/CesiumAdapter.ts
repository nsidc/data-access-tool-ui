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
    handler.setInputAction(
      ({position}: any) => this.handleLeftClick(this.cesiumPositionToLatLon(position)),
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
    );

    handler.setInputAction(
      ({endPosition}: any) => this.handleMouseMove(this.cesiumPositionToLatLon(endPosition)),
      Cesium.ScreenSpaceEventType.MOUSE_MOVE,
    );

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

  private showSpatialSelection() {
    if (!this.extent.global() && this.viewer.scene) {
      const entity = this.viewer.entities.getById("extent");
      const degrees = this.extent.degreesArr();
      if (!entity) {
        this.viewer.entities.add({
          id: "extent",
          name: "extent",
          rectangle: {
            coordinates: Cesium.Rectangle.fromDegrees(...degrees),
            material: CesiumAdapter.extentColor,
          },
        });
      } else {
        entity.rectangle = {
          coordinates: Cesium.Rectangle.fromDegrees(...degrees),
          material: CesiumAdapter.extentColor,
        };
      }
    }
  }

  private handleLeftClick(latLon: ILatLon) {
    const notSelectingExtent = !this.extentSelectionInProgress;
    const startingExtentSelection = this.extentSelectionInProgress && !this.extent.startLatLon;
    const endingExtentSelection = this.extentSelectionInProgress && this.extent.startLatLon;

    if (notSelectingExtent) {

      console.log("Globe clicked, not currently selecting extent.");

    } else if (startingExtentSelection) {

      this.extent.startLatLon = latLon;

    } else if (endingExtentSelection) {

      this.extent.endLatLon = latLon;

      this.extentSelectionInProgress = false;
      this.handleExtentSelected(this.extent.asSpatialSelection());
    }

    this.showSpatialSelection();
  }

  private handleMouseMove(mouseOverLatLon: ILatLon) {
    const validLatLon = (!Number.isNaN(mouseOverLatLon.lat))
                        && (!Number.isNaN(mouseOverLatLon.lon));

    if (this.extentSelectionInProgress && this.extent.startLatLon && validLatLon) {
      this.extent.endLatLon = mouseOverLatLon;
      this.showSpatialSelection();
    }
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

  private cesiumPositionToLatLon(position: any): ILatLon {
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
}
