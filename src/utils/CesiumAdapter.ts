import * as GeoJSON from "geojson";

import { IGeoJsonPolygon } from "../types/GeoJson";
import { PolygonMode } from "./PolygonMode";

/* tslint:disable:no-var-requires */
const Cesium = require("cesium/Cesium");
require("cesium/Widgets/widgets.css");
/* tslint:enable:no-var-requires */

export class CesiumAdapter {
  private static extentColor = new Cesium.Color(0.0, 1.0, 1.0, 0.5);
  private static ellipsoid = Cesium.Ellipsoid.WGS84;

  public polygonMode: PolygonMode;

  private viewer: any;
  private updateSpatialSelection: (s: IGeoJsonPolygon) => void;

  public constructor(updateSpatialSelection: (s: IGeoJsonPolygon) => void) {
    this.updateSpatialSelection = updateSpatialSelection;
  }

  public createViewer(elementId: string, spatialSelection: IGeoJsonPolygon) {
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
      // scene3DOnly set to false as workaround. Increases memory consumption.
      // GH Issue: https://github.com/AnalyticalGraphicsInc/cesium/issues/6365
      scene3DOnly: false, // CHANGEME: true
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
    });

    this.polygonMode = this.createPolygonMode();
    this.renderInitialBoundingBox(spatialSelection);
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
      lat: Number.parseFloat(Cesium.Math.toDegrees(cartographicRadians.latitude)),
      lon: Number.parseFloat(Cesium.Math.toDegrees(cartographicRadians.longitude)),
    };

    return lonLatDegrees;
  }

  public clearSpatialSelection() {
    this.polygonMode.reset();

    this.viewer.scene.primitives.removeAll();
    this.viewer.entities.removeById("rectangle");
  }

  public renderInitialBoundingBox(spatialSelection: IGeoJsonPolygon) {
    const bbox = spatialSelection.bbox;
    if (!bbox) { return; }

    const globalBbox = [-180, -90, 180, 90];

    if (bbox.every((val: number, i: number) => val === globalBbox[i])) {
      return;
    }

    const rectangleRadians = new Cesium.Rectangle.fromDegrees(...bbox);

    this.clearSpatialSelection();
    this.viewer.entities.add({
      id: "rectangle",
      name: "rectangle",
      rectangle: {
        coordinates: rectangleRadians,
        material: CesiumAdapter.extentColor,
      },
    });
  }

  private createPolygonMode() {

    // when drawing is finished (by double-clicking), this function is called
    // with an array of points; each point has the cartesianXYZ--describing the
    // location on the globe--and screenPosition--the XY point on the screen
    // that was clicked when that point was added. Note that the screenPosition
    // may no longer match the screenPosition corresponding to that spot on the
    // globe, since the globe could have been rotated since the time that point
    // was added by a click.
    const finishedDrawingCallback = (points: any) => {
      const cartesians = points.map((p: any) => p.cartesianXYZ);

      const lonLatsArray = cartesians.map((cartesian: any) => {
        const lonLat = this.cartesianPositionToLonLatDegrees(cartesian);
        return [lonLat.lon, lonLat.lat];
      }, this);

      // use the screen positions to determine clockwise/counterclockwise
      //
      // with the cesium widget, (0, 0) is at the top left, with x increasing to
      // the right and y increasing down; the shoelace formula works with a
      // standard cartesian system where y increases up, so inverse the y value
      // before applying the shoelace formula
      const pointsDrawnOnScreen = points.map((p: any) => [p.screenPosition.x, -p.screenPosition.y]);

      // CMR requires polygons to be in counterclockwise order
      if (this.polygonIsClockwise(pointsDrawnOnScreen)) {
        lonLatsArray.reverse();
      }

      // the last point in a polygon needs to be the first again to close it
      lonLatsArray.push(lonLatsArray[0]);

      const geo = GeoJSON.parse({polygon: [lonLatsArray]}, {Polygon: "polygon"});
      this.updateSpatialSelection(geo);
    };

    const mode = new PolygonMode(this.viewer.scene, CesiumAdapter.ellipsoid, finishedDrawingCallback);
    return mode;
  }

  // https://stackoverflow.com/a/1165943
  // http://en.wikipedia.org/wiki/Shoelace_formula
  private polygonIsClockwise(coords: number[][]) {
    const sum = coords.reduce((acc: number, coord: number[], index: number, arr: number[][]) => {
      const [x, y] = coord;

      const nextIndex = (index + 1) % arr.length;
      const [nextX, nextY] = arr[nextIndex];

      const edge = (nextX - x) * (nextY + y);

      return acc + edge;
    }, 0);

    return sum > 0;
  }
}

interface ILonLat {
  readonly lat: number;
  readonly lon: number;
}
