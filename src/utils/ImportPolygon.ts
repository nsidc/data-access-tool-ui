import * as shapefile from "shapefile";
import { IGeoJsonPolygon } from "../types/GeoJson";

export class ImportPolygon {

  private importPolygonCallback: (s: IGeoJsonPolygon) => void;

  public constructor(importPolygonCallback: (s: IGeoJsonPolygon) => void) {
    this.importPolygonCallback = importPolygonCallback;
  }

  public importFile(filename: File) {
    if (filename.type === "application/json") {
      this.GeoJSON(filename);
      return "";
    } else if (filename.name.endsWith(".shp")) {
      this.Shapefile(filename);
      return "";
    } else {
      return "Error: File must be GeoJSON or .shp shapefile. \
          Please choose a different file.";
    }

  }

  private GeoJSON(filename: File) {
    const handleFileRead = () => {
      if (typeof fileReader.result === "string") {
        const feature = this.parseGeoJSON(JSON.parse(fileReader.result));
        this.importPolygonCallback(feature);
      }
    };
    const fileReader = new FileReader();
    fileReader.onloadend = handleFileRead;
    fileReader.readAsText(filename);
  }

  private Shapefile(filename: File) {
    const handleFileRead = () => {
      if (fileReader.result) {
        shapefile.read(fileReader.result).then((geoJSON: any) => {
          const feature = this.parseGeoJSON(geoJSON);
          this.importPolygonCallback(feature);
        });
      }
    };
    const fileReader = new FileReader();
    fileReader.onloadend = handleFileRead;
    fileReader.readAsArrayBuffer(filename);
  }

  private parseGeoJSON(geoJSON: any) {
    let feature: IGeoJsonPolygon = {
      geometry: { coordinates: [], type: "" },
      properties: {},
      type: "",
    };

    if (!geoJSON || !geoJSON.type) {
      return feature;
    }

    if (geoJSON.type === "FeatureCollection") {
      if (geoJSON.features && geoJSON.features.length > 0) {
        feature = geoJSON.features[0];
      }
    } else if (geoJSON.type === "Feature") {
      feature = geoJSON;
    } else if (geoJSON.type === "GeometryCollection") {
      if (geoJSON.geometries && geoJSON.geometries.length > 0) {
        feature = {
          geometry: geoJSON.geometries[0],
          properties: {},
          type: "Feature",
        };
      }
    } else if (geoJSON.type === "Polygon" || geoJSON.type === "MultiPolygon") {
      if (geoJSON.coordinates && geoJSON.coordinates.length > 0) {
        feature = {
          geometry: geoJSON,
          properties: {},
          type: "Feature",
        };
      }
    }

    // For multi-polygons, pick the first.
    if (feature.type === "Feature") {
      if (feature.geometry.type === "MultiPolygon") {
        const firstPoly: any = feature.geometry.coordinates[0];
        feature = {
          geometry: {
            coordinates: firstPoly,
            type: "Polygon",
          },
          properties: {},
          type: "Feature",
        };
      }
      // For polygons with multiple linear rings, pick the first (exterior) one.
      if (feature.geometry.type === "Polygon") {
        if (feature.geometry.coordinates.length > 1) {
          feature = {
            geometry: {
              coordinates: [feature.geometry.coordinates[0]],
              type: "Polygon",
            },
            properties: {},
            type: "Feature",
          };
        }

        if (!("properties" in feature)) {
          feature = { ...feature, properties: {}};
        }
      }
    }

    return feature;
  }
}
