import { IGeoJsonPolygon } from "../types/GeoJson";

export class ImportPolygon {

  private importPolygonCallback: (s: IGeoJsonPolygon) => void;

  public constructor(importPolygonCallback: (s: IGeoJsonPolygon) => void) {
    this.importPolygonCallback = importPolygonCallback;
  }

  public GeoJSON(filename: File) {
    let fileReader: FileReader;

    const handleFileRead = () => {
      if (typeof fileReader.result === "string") {
        const geoJSON = JSON.parse(fileReader.result);
        let feature: IGeoJsonPolygon = {
          geometry: {coordinates: [], type: ""},
          type: "",
        };
        if (geoJSON && geoJSON.type) {
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
                type: "Feature",
              };
            }
          }
        }
        if (feature.type !== "") {
          this.importPolygonCallback(feature);
        }
      }
    };

    fileReader = new FileReader();
    fileReader.onloadend = handleFileRead;
    fileReader.readAsText(filename);
  }

}
