import * as GeoJSON from "geojson";

import { ILonLat } from "../LonLat";
import { ISpatialSelection } from "../SpatialSelection";
// import { Extent } from "../utils/Extent";
import { PolygonMode } from "./PolygonMode";

/* tslint:disable:no-var-requires */
const Cesium = require("cesium/Cesium");
require("cesium/Widgets/widgets.css");
/* tslint:enable:no-var-requires */

export class CesiumAdapter {
  // private static extentColor = new Cesium.Color(0.0, 1.0, 1.0, 0.5);
  private static ellipsoid = Cesium.Ellipsoid.WGS84;

  // private extent: Extent;
  private viewer: any;

  private updateSpatialSelection: any;

  public constructor(updateSpatialSelection: any) {
    this.updateSpatialSelection = updateSpatialSelection;
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
  }

  // cartesianXYZ: 3D coordinates for position on earth's surface
  // https://en.wikipedia.org/wiki/ECEF
  public cartesianPositionToLonLatDegrees(cartesianXYZ: any): ILonLat {
    // this means the position is not on the globe
    if (cartesianXYZ === undefined) {
      return {lat: NaN, lon: NaN};
    }

    const cartographicRadians = Cesium.Cartographic.fromCartesian(cartesianXYZ);

    const lonLatDegrees = {
      lat: Number.parseFloat(Cesium.Math.toDegrees(cartographicRadians.latitude).toFixed(2)),
      lon: Number.parseFloat(Cesium.Math.toDegrees(cartographicRadians.longitude).toFixed(2)),
    };

    return lonLatDegrees;
  }

  public startPolygonMode() {

    // when drawing is finished (by double-clicking), this function is called
    // with cartesian positions
    const finishedDrawingCallback = (positions: any) => {
      let lonLatsArray = positions.map((position: any) => {
        const lonLat = this.cartesianPositionToLonLatDegrees(position);
        return [lonLat.lon, lonLat.lat];
      }, this);

      // CMR requires polygons to be in "counterclockwise" order
      lonLatsArray = this.ensureCounterClockwise(lonLatsArray);

      // the last point in a polygon needs to be the first again to close it
      lonLatsArray.push(lonLatsArray[0]);

      const geo = GeoJSON.parse({polygon: lonLatsArray}, {Polygon: "polygon"});
      console.log(geo);
      this.updateSpatialSelection(geo);
    };

    const mode = new PolygonMode(this.viewer.scene, CesiumAdapter.ellipsoid, finishedDrawingCallback);

    return mode.start();
  }

 public clearSpatialSelection() {
   this.viewer.scene.primitives.removeAll();
 }

  // https://stackoverflow.com/a/1165943
  // http://en.wikipedia.org/wiki/Shoelace_formula
  private ensureCounterClockwise(lonLatsArray: number[][]) {
    const sum = lonLatsArray.reduce((acc: number, lonLat: number[], index: number, arr: number[][]) => {
      const nextIndex = (index + 1) % arr.length;

      const [lon, lat] = lonLat;
      const [nextLon, nextLat] = arr[nextIndex];

      const edge = (nextLat - lat) * (nextLon + lon);

      return acc + edge;
    }, 0);

    const polygonIsClockwise = sum < 0;
    if (polygonIsClockwise) {
      return lonLatsArray.reverse();
    } else {
      return lonLatsArray;
    }
  }
}
