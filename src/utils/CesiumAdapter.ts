import * as GeoJSON from "geojson";

import { IGeoJsonPolygon } from "../types/GeoJson";
import { PolygonMode } from "./PolygonMode";

/* tslint:disable:no-var-requires */
const Cesium = require("cesium/Cesium");
require("cesium/Widgets/widgets.css");
/* tslint:enable:no-var-requires */

const gibsGeographicTilingScheme = () => {
  const ggts = new Cesium.GeographicTilingScheme();

  const tilePixels = 512;
  const rectangle = Cesium.Rectangle.MAX_VALUE;

  // Resolution: radians per pixel
  const levels = [
    { width: 2, height: 1, resolution: 0.009817477042468103 },
    { width: 3, height: 2, resolution: 0.004908738521234052 },
    { width: 5, height: 3, resolution: 0.002454369260617026 },
    { width: 10, height: 5, resolution: 0.001227184630308513 },
    { width: 20, height: 10, resolution: 0.0006135923151542565 },
    { width: 40, height: 20, resolution: 0.00030679615757712823 },
    { width: 80, height: 40, resolution: 0.00015339807878856412 },
    { width: 160, height: 80, resolution: 0.00007669903939428206 },
    { width: 320, height: 160, resolution: 0.00003834951969714103 },
  ];

  ggts.getNumberOfXTilesAtLevel = (level: number) => {
    const result = levels[level].width;
    return result;
  };

  ggts.getNumberOfYTilesAtLevel = (level: number) => {
    const result = levels[level].height;
    return result;
  };

  ggts.tileXYToRectangle = (x: number, y: number, level: number, result: any) => {
    const resolution = levels[level].resolution;

    const xTileWidth = resolution * tilePixels;
    const west = x * xTileWidth + rectangle.west;
    const east = (x + 1) * xTileWidth + rectangle.west;

    const yTileHeight = resolution * tilePixels;
    const north = rectangle.north - y * yTileHeight;
    const south = rectangle.north - (y + 1) * yTileHeight;

    if (!result) {
      result = new Cesium.Rectangle(0, 0, 0, 0);
    }
    result.west = west;
    result.south = south;
    result.east = east;
    result.north = north;
    return result;
  };

  ggts.positionToTileXY = (position: any, level: number, result: any) => {
    if (!Cesium.Rectangle.contains(rectangle, position)) {
      return undefined;
    }

    const xTiles = levels[level].width;
    const yTiles = levels[level].height;
    const resolution = levels[level].resolution;

    const xTileWidth = resolution * tilePixels;
    const yTileHeight = resolution * tilePixels;

    let longitude = position.longitude;
    if (rectangle.east < rectangle.west) {
      longitude += Cesium.Math.TWO_PI;
    }

    let xTileCoordinate = Math.floor((longitude - rectangle.west) / xTileWidth);
    if (xTileCoordinate >= xTiles) {
      xTileCoordinate = xTiles - 1;
    }

    const latitude = position.latitude;
    let yTileCoordinate = Math.floor((rectangle.north - latitude) / yTileHeight);
    if (yTileCoordinate > yTiles) {
      yTileCoordinate = yTiles - 1;
    }

    if (!result) {
      result = new Cesium.Cartesian2(0, 0);
    }
    result.x = xTileCoordinate;
    result.y = yTileCoordinate;
    return result;
  };

  return ggts;
};

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
    const gibsProvider = new Cesium.WebMapTileServiceImageryProvider({
      format: "image/jpeg",
      layer: "BlueMarble_ShadedRelief_Bathymetry",
      maximumLevel: 7,
      minimumLevel: 0,
      style: "",
      tileHeight: 512,
      tileMatrixSetID: "EPSG4326_500m",
      tileWidth: 512,
      tilingScheme: gibsGeographicTilingScheme(),
      url: "//gibs.earthdata.nasa.gov/wmts/epsg4326/best/wmts.cgi",
    });

    this.viewer = new Cesium.Viewer(elementId, {
      animation: false,
      baseLayerPicker: false,
      creditContainer: "credit",
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      imageryProvider: gibsProvider,
      infoBox: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      scene3DOnly: true,
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
