import * as GeoJSON from "geojson";

import { IGeoJsonPolygon } from "../types/GeoJson";
import { CesiumUtils } from "../utils/CesiumUtils";
import { MIN_VERTICES, PolygonMode } from "./PolygonMode";

/* tslint:disable:no-var-requires */
const Cesium = require("cesium/Cesium");
require("cesium/Widgets/widgets.css");
/* tslint:enable:no-var-requires */

export class CesiumAdapter {
  private static extentColor = new Cesium.Color(0.0, 1.0, 1.0, 0.4);
  private static ellipsoid = Cesium.Ellipsoid.WGS84;

  public polygonMode: PolygonMode;

  private viewer: any;
  private updateSpatialSelection: (s: IGeoJsonPolygon) => void;
  private lonLatEnableCallback: (s: boolean) => void;
  private lonLatLabelCallback: (s: string) => void;

  public constructor(updateSpatialSelection: (s: IGeoJsonPolygon) => void,
                     lonLatEnableCallback: (s: boolean) => void,
                     lonLatLabelCallback: (s: string) => void) {
    this.updateSpatialSelection = updateSpatialSelection;
    this.lonLatLabelCallback = lonLatLabelCallback;
    this.lonLatEnableCallback = lonLatEnableCallback;
  }

  public createViewer() {
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

    this.viewer = new Cesium.Viewer(CesiumUtils.viewerId, {
      animation: false,
      baseLayerPicker: false,
      creditContainer: "credit",
      fullscreenButton: false,
      geocoder: false,
      homeButton: true,
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
  }

  public clearSpatialSelection() {
    this.polygonMode.reset();
    this.viewer.scene.primitives.removeAll();
  }

  public renderCollectionCoverage(bbox: number[]): void {
    this.cameraFlyToCollectionCoverage(bbox);

    // TODO: "rectangle" is a dumb name
    const ENTITY_ID = "rectangle";

    // remove any already-existing collection coverage (this *should* only exist
    // if in stand-alone app--i.e., not in Drupal--and switching the selected
    // dataset)
    this.viewer.entities.removeById(ENTITY_ID);

    if (!this.collectionCoverageIsGlobal(bbox)) {
      // draw rectangle showing collection's coverage
      const rectangleRadians = new Cesium.Rectangle.fromDegrees(...bbox);
      this.viewer.entities.add({
        id: ENTITY_ID,
        name: ENTITY_ID,
        rectangle: {
          coordinates: rectangleRadians,
          material: CesiumAdapter.extentColor,
        },
      });
    }
  }

  public renderSpatialSelection(spatialSelection: IGeoJsonPolygon | null): void {
    if (spatialSelection === null) { return; }

    const points = spatialSelection.geometry.coordinates[0].map((coord: number[]) => {
      const [lon, lat] = coord;
      return this.polygonMode.lonLatToCartesianPosition({lon, lat});
    });

    this.polygonMode.billboardCollectionFromPoints(points);
    this.polygonMode.renderPolygonFromPoints(points);
  }

  private cameraFlyToCollectionCoverage(collectionBbox: number[]): void {
    const boulderCO = [-135, 10, -75, 70];
    const flyToRectangle = this.collectionCoverageIsGlobal(collectionBbox) ? boulderCO : collectionBbox;

    // Fly to the chosen position (collection's coverage *or* Boulder, CO) with a top-down view
    Cesium.Camera.DEFAULT_VIEW_FACTOR = 0.15;
    Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(...flyToRectangle);
    this.viewer.camera.flyHome();
  }

  private collectionCoverageIsGlobal(bbox: number[]): boolean {
    const globalBbox = [-180, -90, 180, 90];
    return bbox.every((val: number, i: number) => val === globalBbox[i]);
  }

  private createPolygonMode() {

    // when drawing is finished (by double-clicking), this function is called
    // with an array of points.
    const finishedDrawingCallback = (points: any) => {
      const lonLatsArray = points.map((point: any) => {
        const lonLat = this.polygonMode.cartesianPositionToLonLatDegrees(point);
        return [lonLat.lon, lonLat.lat];
      }, this);

      let geo;

      if (lonLatsArray.length >= MIN_VERTICES) {
        // the last point in a polygon needs to be the first again to close it
        lonLatsArray.push(lonLatsArray[0]);
        geo = GeoJSON.parse({polygon: [lonLatsArray]}, {Polygon: "polygon"});
      } else {
        geo = null;
      }
      this.updateSpatialSelection(geo);
    };

    const mode = new PolygonMode(this.viewer.scene, this.lonLatEnableCallback,
      this.lonLatLabelCallback, CesiumAdapter.ellipsoid, finishedDrawingCallback);
    return mode;
  }

}

/* The code to use NASA GIBS imagery was based on and adapted from
 * code in the following repository:
 *
 * https://github.com/nasa-gibs/gibs-web-examples
 *
 * See also:
 *
 * https://wiki.earthdata.nasa.gov/display/GIBS/Global+Imagery+Browse+Services+-+GIBS
 * https://wiki.earthdata.nasa.gov/display/GIBS/GIBS+API+for+Developers
 * https://wiki.earthdata.nasa.gov/display/GIBS/GIBS+Available+Imagery+Products
 */
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
