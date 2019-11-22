import * as shapefile from "shapefile";
import { IGeoJsonPolygon } from "../types/GeoJson";

export class ImportPolygon {

  private importPolygonCallback: (s: IGeoJsonPolygon) => void;

  public constructor(importPolygonCallback: (s: IGeoJsonPolygon) => void) {
    this.importPolygonCallback = importPolygonCallback;
  }

  public GeoJSON(filename: File) {
    const handleFileRead = () => {
      if (typeof fileReader.result === "string") {
        this.handleGeoJSON(JSON.parse(fileReader.result));
      }
    };
    const fileReader = new FileReader();
    fileReader.onloadend = handleFileRead;
    fileReader.readAsText(filename);
  }

  public Shapefile(filename: File) {
    const handleFileRead = () => {
      if (fileReader.result) {
        shapefile.read(fileReader.result).then((geoJSON) => {
          this.handleGeoJSON(geoJSON);
        });
      }
    };
    const fileReader = new FileReader();
    fileReader.onloadend = handleFileRead;
    fileReader.readAsArrayBuffer(filename);
  }

  private handleGeoJSON(geoJSON: any) {
    let feature: IGeoJsonPolygon = {
      geometry: { coordinates: [], type: "" },
      type: "",
    };
    if (geoJSON && geoJSON.type) {
      if (geoJSON.type === "FeatureCollection") {
        if (geoJSON.features && geoJSON.features.length > 0) {
          feature = geoJSON.features[0];
          // Some shapefiles have multiple parts per shape. Pick the first.
          if (feature.geometry.type === "MultiPolygon") {
            const firstPoly: any = feature.geometry.coordinates[0];
            feature = {
              geometry: {
                coordinates: firstPoly,
                type: "Polygon",
              },
              type: "Feature",
            };
          }
        }
      } else if (geoJSON.type === "Feature") {
        feature = geoJSON;
      } else if (geoJSON.type === "GeometryCollection") {
        if (geoJSON.geometries && geoJSON.geometries.length > 0) {
          feature = {
            geometry: geoJSON.geometries[0],
            type: "Feature",
          };
        }
      }
    }
    this.importPolygonCallback(feature);
  }
}
