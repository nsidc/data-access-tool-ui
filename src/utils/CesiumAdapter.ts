import * as Cesium from "cesium";
import "cesium-widgets/widgets.css";
import * as GeoJSON from "geojson";
import { List } from "immutable";

import { BoundingBox } from "../types/BoundingBox";
import { IGeoJsonPolygon } from "../types/GeoJson";
import { CesiumUtils, ILonLat } from "../utils/CesiumUtils";
import { boundingBoxMatch } from "../utils/CMR";
import { BoundingBoxMode } from "./BoundingBoxMode";
import { ImportPolygon } from "./ImportPolygon";
import { Point } from "./Point";
import { MIN_VERTICES, PolygonMode } from "./PolygonMode";

enum Circumpolar {
  Neither,
  North,
  South,
}

export class CesiumAdapter {
  private static extentColor = new Cesium.Color(0.0, 1.0, 1.0, 0.3);
  private static ellipsoid: Cesium.Ellipsoid = Cesium.Ellipsoid.WGS84;

  public boundingBoxMode: BoundingBoxMode;
  public polygonMode: PolygonMode;
  public importPolygon: ImportPolygon;

  private viewer: Cesium.Viewer;
  private bboxPrimitive: any;
  private updateBoundingBox: (s: BoundingBox) => void;
  private updateSpatialSelection: (s: IGeoJsonPolygon) => void;
  private lonLatEnableCallback: (s: boolean) => void;
  private lonLatLabelCallback: (s: string) => void;
  private setCmrErrorMessage: (msg: string) => void;

  public constructor(updateBoundingBox: (s: BoundingBox) => void,
                     updateSpatialSelection: (s: IGeoJsonPolygon) => void,
                     lonLatEnableCallback: (s: boolean) => void,
                     lonLatLabelCallback: (s: string) => void,
                     setCmrErrorMessage: (msg: string) => void) {
    this.updateBoundingBox = updateBoundingBox;
    this.updateSpatialSelection = updateSpatialSelection;
    this.lonLatLabelCallback = lonLatLabelCallback;
    this.lonLatEnableCallback = lonLatEnableCallback;
    this.setCmrErrorMessage = setCmrErrorMessage;
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
      homeButton: false,
      imageryProvider: gibsProvider,
      infoBox: false,
      maximumRenderTimeChange: Infinity,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      requestRenderMode: true,
      scene3DOnly: true,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
    });

    // By default a double click on the globe zooms into
    // the current polygon and switches to a weird rotate mode.
    // Remove the double-click handler to avoid this.
    this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    this.boundingBoxMode = this.createBoundingBoxMode();
    this.polygonMode = this.createPolygonMode();
  }

  public clearBoundingBox() {
    this.boundingBoxMode.reset();
    this.updateBoundingBox(BoundingBox.global());
  }

  public startBoundingBox() {
    this.boundingBoxMode.start();
  }

  public clearSpatialSelection = (): void => {
    this.polygonMode.reset();
  }

  public startSpatialSelection() {
    this.polygonMode.start();
  }

  public doImportPolygon(files: FileList) {
    if (!this.importPolygon) {
      this.importPolygon = new ImportPolygon(this.importPolygonCallback);
    }
    const err = this.importPolygon.importFile(files[0]);
    if (err) {
      this.setCmrErrorMessage(err);
    }
  }

  public renderCollectionCoverage(bbox: BoundingBox): void {
    const ENTITY_ID = "collectionCoverage";

    // remove any already-existing collection coverage (this *should* only exist
    // if in stand-alone app--i.e., not in Drupal--and switching the selected
    // dataset)
    this.viewer.entities.removeById(ENTITY_ID);

    if (!this.collectionCoverageIsGlobal(bbox)) {
      // draw rectangle showing collection's coverage
      const rectangleRadians = Cesium.Rectangle.fromDegrees(...bbox.rect);
      this.viewer.entities.add(new Cesium.Entity({
        id: ENTITY_ID,
        name: ENTITY_ID,
        rectangle: new Cesium.RectangleGraphics({
          // Cesium docs (and @types/cesium) show that `coordinates` and
          // `material` must be of type `Property`, yet they have examples using
          // the same types we use here (`Rectangle` and `Color`)
          coordinates: (rectangleRadians as any),
          material: (CesiumAdapter.extentColor as any),
        }),
      }));
    }
  }

  public displayBoundingBox(collectionSpatialCoverage: BoundingBox | null,
                            boundingBox: BoundingBox, hasSpatialSelection: boolean): void {
    const collectionBoundingBox = collectionSpatialCoverage ?
      collectionSpatialCoverage : BoundingBox.global();
    const doRender =
      !boundingBoxMatch(boundingBox, collectionBoundingBox) && !hasSpatialSelection;
    if (!doRender) {
      this.boundingBoxMode.reset();
    }
    this.renderBoundingBox(boundingBox, doRender);
  }

  public renderSpatialSelection(spatialSelection: IGeoJsonPolygon | null): void {
    if (spatialSelection === null) { return; }
    this.polygonMode.polygonFromLonLats(spatialSelection.geometry.coordinates[0]);
  }

  public flyHome() {
    // @types/cesium incorrectly has the parameter to Camera.flyHome as required
    // instead of optional
    (this.viewer.camera as any).flyHome();
  }

  public setFlyToSpatialSelection(spatialSelection: IGeoJsonPolygon | null): void {
    if (spatialSelection && spatialSelection.geometry.type === "Polygon") {
      const coords = spatialSelection.geometry.coordinates;
      if (coords.length >= 1 && coords[0].length >= 3) {
        const bbox = coords[0].reduce((bb: BoundingBox, coord) => {
          bb.west = Math.min(bb.west, coord[0]);
          bb.east = Math.max(bb.east, coord[0]);
          bb.south = Math.min(bb.south, coord[1]);
          bb.north = Math.max(bb.north, coord[1]);
          return bb;
        }, new BoundingBox(180, 90, -180, -90));
        this.setFlyToRect(bbox);
      }
    }
  }

  public setFlyToRect(bbox: BoundingBox): void {
    const boulderCO = new BoundingBox(-135, 10, -75, 70);
    const flyTo = this.collectionCoverageIsGlobal(bbox) ? boulderCO : bbox;

    // Fly to the chosen position (collection's coverage *or* Boulder, CO) with a top-down view
    Cesium.Camera.DEFAULT_VIEW_FACTOR = 0.15;
    Cesium.Camera.DEFAULT_VIEW_RECTANGLE =
      Cesium.Rectangle.fromDegrees(...flyTo.rect);
  }

  private importPolygonCallback = (poly: IGeoJsonPolygon) => {
    if (poly.type !== "Feature" || poly.geometry.type !== "Polygon") {
      this.setCmrErrorMessage("Error: File does not contain a valid polygon. \
          Please choose a different file.");
      return;
    }
    let points = poly.geometry.coordinates[0];
    // Trim useless decimal digits so we can load more coordinates
    points = points.map((point) => {
      if (!point) { return [0, 0]; }
      return [Math.round(point[0] * 1e6) / 1e6, Math.round(point[1] * 1e6) / 1e6];
    });
    const lonLatsArray = List(points).map((point) => {
      if (!point) { return { lon: 0, lat: 0 }; }
      return { lon: point[0], lat: point[1] };
    }).toList();
    // Note: Maximum browser length is currently 8192. The max length here is
    // based on the total number of characters in the CMR query.
    // We need to catch this here because CMR does not return a useful error.
    if (points.join(",").length > 7800) {
      this.setCmrErrorMessage("Error: Polygon has too many points. \
          Please choose a file with less than 350 polygon points.");
      return;
    }
    if (this.polygonIsClockwise(lonLatsArray)) {
      points = points.reverse();
    }
    poly.geometry.coordinates[0] = points;
    this.polygonMode.polygonFromLonLats(poly.geometry.coordinates[0]);
    this.updateSpatialSelection(poly);
    this.setFlyToSpatialSelection(poly);
    this.flyHome();
  }

  private renderBoundingBox = (boundingBox: BoundingBox, doRender: boolean) => {
    if (this.bboxPrimitive) {
      this.viewer.scene.primitives.remove(this.bboxPrimitive);
      Cesium.destroyObject(this.bboxPrimitive);
      this.bboxPrimitive = null;
    }

    if (doRender) {
      const appearance = new Cesium.EllipsoidSurfaceAppearance({
        aboveGround: false,
      });
      const rectangle = new Cesium.RectangleGeometry({
        ellipsoid: Cesium.Ellipsoid.WGS84,
        height: 0,
        rectangle: Cesium.Rectangle.fromDegrees(...boundingBox.rect),
      });
      const geometry = Cesium.RectangleGeometry.createGeometry(rectangle);
      // The geometry can be undefined if all 3 points are on a line, etc.
      if (geometry !== undefined) {
        const geometryInstances = new Cesium.GeometryInstance({
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.BLUE),
          },
          geometry,
        });
        this.bboxPrimitive = new Cesium.Primitive({
          appearance,
          asynchronous: false,
          geometryInstances,
        });
        this.viewer.scene.primitives.add(this.bboxPrimitive);
      }
    }

    this.viewer.scene.requestRender();
  }

  private collectionCoverageIsGlobal(bbox: BoundingBox): boolean {
    const globalBbox = [-180, -90, 180, 90];
    return bbox.rect.every((val: number, i: number) => val === globalBbox[i]);
  }

  private fixDatelineCoordinates(lonLatsIn: List<ILonLat>) {
    const lons = lonLatsIn.map((lonLat) => lonLat!.lon);
    const crossesDateline = ((lons.max() - lons.min()) > 180);
    let lonLats: List<ILonLat> = lonLatsIn;
    if (crossesDateline) {
      lonLats = lonLatsIn.map((lonLat) => {
        const lon = lonLat!.lon;
        return {lon: (lon >= 0) ? lon : lon + 360, lat: lonLat!.lat};
      }).toList();
    }
    return lonLats;
  }

  private isCircumPolar(lonLatsIn: List<ILonLat>) {
    const lons = lonLatsIn.map((lonLat) => lonLat!.lon);
    const lats = lonLatsIn.map((lonLat) => lonLat!.lat);
    const circumPolar = ((lons.max() - lons.min()) > 180);
    return circumPolar ? ((lats.max() >= 0) ? Circumpolar.North : Circumpolar.South) : Circumpolar.Neither;
  }

  // Find the difference between one longitude and the next;
  // If the difference is positive then add +1, otherwise add -1.
  // For the Northern hemisphere if the sum is positive then the
  // polygon is counterclockwise; vice versa for the Southern hemisphere.
  private polarWindingIsPositive(lonLats: List<ILonLat>) {
    // Convert to JS to avoid all of the Immutable undefined's.
    // TODO: Update when Immutable 4 is released and installed
    const lons = lonLats.map((lonLat) => lonLat!.lon).toJS();
    const winding = lons.reduce((acc: number, lon: number, index: number) => {
      const nextIndex = ((index ? index : 0) + 1) % lons.length;
      const diff = lons[nextIndex] - lon;
      return acc + ((diff < -180 || (diff >= 0 && diff < 180)) ? 1 : -1);
    }, 0);
    return winding > 0;
  }

  // https://stackoverflow.com/a/1165943
  // http://en.wikipedia.org/wiki/Shoelace_formula
  private polygonIsClockwise(lonLatsIn: List<ILonLat>) {
    const lonLats = this.fixDatelineCoordinates(lonLatsIn);

    const circumPolar = this.isCircumPolar(lonLats);
    if (circumPolar !== Circumpolar.Neither) {
      const windingIsPositive = this.polarWindingIsPositive(lonLats);
      return (circumPolar === Circumpolar.North) ? (!windingIsPositive) : (windingIsPositive);
    }

    // Convert to JS to avoid all of the Immutable undefined's.
    // TODO: Update when Immutable 4 is released and installed
    const lonLatsJS: ILonLat[] = lonLats.toJS();

    const sum = lonLatsJS.reduce((acc: number, lonLat: ILonLat, index: number) => {
      const next = ((index ? index : 0) + 1) % lonLatsJS.length;
      const edge = (lonLatsJS[next].lon - lonLat.lon) * (lonLatsJS[next].lat + lonLat.lat);
      return acc + edge;
    }, 0);

    return sum > 0;
  }

  private updateLonLatLabel = (cartesian: Cesium.Cartesian3 | null) => {
    try {
      if (cartesian) {
        this.lonLatLabelCallback(CesiumUtils.getLonLatLabel(cartesian));
      } else {
        this.lonLatLabelCallback("");
      }
    } catch (error) {
      this.lonLatLabelCallback("");
    }
  }

  private createBoundingBoxMode() {
    const finishedDrawingCallback = (s: BoundingBox) => {
      // Round to 2 decimal places
      s.west = Math.round(s.west * 100) / 100;
      s.south = Math.round(s.south * 100) / 100;
      s.east = Math.round(s.east * 100) / 100;
      s.north = Math.round(s.north * 100) / 100;
      this.updateBoundingBox(s);
    };
    const mode = new BoundingBoxMode(this.viewer, CesiumAdapter.ellipsoid,
      this.renderBoundingBox, finishedDrawingCallback, this.updateLonLatLabel);
    return mode;
  }

  private createPolygonMode() {

    // when drawing is finished (by double-clicking), this function is called
    // with an array of points.
    const finishedDrawingCallback = (points: List<Point>) => {
      let lonLats = points.map((point) => {
        const lonLat = CesiumUtils.cartesianToLonLat(point!.cartesian);
        return lonLat;
      }).toList();

      if (this.polygonIsClockwise(lonLats)) {
        lonLats = lonLats.reverse().toList();
      }

      const lonLatsArray = lonLats.map((lonLat) => {
        return [lonLat!.lon, lonLat!.lat];
      }).toJS();

      let geo = null;
      if (lonLatsArray.length >= MIN_VERTICES) {
        // the last point in a polygon needs to be the first again to close it
        lonLatsArray.push(lonLatsArray[0]);
        geo = GeoJSON.parse({ polygon: [lonLatsArray] }, { Polygon: "polygon" });
      }
      this.updateSpatialSelection(geo);
    };

    const mode = new PolygonMode(this.viewer.scene, this.lonLatEnableCallback,
      this.updateLonLatLabel, CesiumAdapter.ellipsoid, finishedDrawingCallback);
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

  ggts.tileXYToRectangle = (x: number, y: number, level: number, result?: Cesium.Rectangle) => {
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

  ggts.positionToTileXY = (position: Cesium.Cartographic, level: number, result: any) => {
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
