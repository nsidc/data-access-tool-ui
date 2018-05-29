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

    this.updateSpatialSelection(spatialSelection);
  }

  public updateSpatialSelection(s: ISpatialSelection) {
    this.extent = new Extent(s);
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
    if (!this.extent.isGlobal() && this.viewer.scene) {
      const entity = this.viewer.entities.getById("extent");

      const degrees = this.extent.degreesArr();
      const rectangle = {
        coordinates: Cesium.Rectangle.fromDegrees(...degrees),
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

  // the cesium left click event emits an object with {position}
  private handleLeftClick({position}: any) {
    // would be nice to have a decorator for this, to just skip the function if
    // the selection button hasn't been pressed and we don't need to do anything
    // with clicks anyway (these lines are also in handleMouseMove)
    const selectionInactive = !this.extentSelectionInProgress;
    if (selectionInactive) { return; }

    // would be nice to have a decorator for this, to just skip the function if
    // the position is not on the globe (these lines are also in handleMouseMove)
    const latLon = this.cesiumPositionToLatLon(position);
    if (this.latLonIsNaN(latLon)) { return; }

    const startingExtentSelection = !this.extent.startLatLon;
    const endingExtentSelection = this.extent.startLatLon;

    if (startingExtentSelection) {
      this.extent.startDrawing(latLon);

    } else if (endingExtentSelection) {
      this.extent.stopDrawing(latLon);

      this.extentSelectionInProgress = false;
      this.handleExtentSelected(this.extent.asSpatialSelection());
    }
  }

  // the cesium mouse move event emits an object with {startPosition, endPosition}
  private handleMouseMove({endPosition}: any) {
    const selectionInactive = !this.extentSelectionInProgress;
    if (selectionInactive) { return; }

    const latLon = this.cesiumPositionToLatLon(endPosition);
    if (this.latLonIsNaN(latLon)) { return; }

    const selectionStarted = !!this.extent.startLatLon;
    if (!selectionStarted) { return; }

    if (this.extent.drawDirection === null) {
      this.extent.updateDrawDirection(latLon);
    }

    this.extent.updateFromDrawing(latLon);
    this.showSpatialSelection();
  }

  private latLonIsNaN(latLon: ILatLon) {
    return Number.isNaN(latLon.lat) || Number.isNaN(latLon.lon);
  }
}

export default CesiumAdapter;
