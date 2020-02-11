// import { BoundingBox } from "../src/types/BoundingBox";
import { IGeoJsonPolygon } from "../src/types/GeoJson";
import { ImportPolygon } from "../src/utils/ImportPolygon";

const doTestPolygon = (testName: string, file: any, expected: any) => {
  test(testName, (done) => {
    const callback = (poly: IGeoJsonPolygon) => {
      try {
        expect(poly).toEqual(expected);
        done();
      } catch (error) {
        done.fail(error);
      }
    };
    const importPolygon = new ImportPolygon(callback);
    importPolygon.importFile(file);
  });
};

describe("GeoJSON files", () => {
  // GeoJSON have polygons in counterclockwise order.
  const expectedGeoJSON = {
    geometry:
    {
      coordinates:
        [[[100, 0], [101, 0], [101, 1], [100, 1], [100, 0]]],
      type: "Polygon",
    },
    properties: {},
    type: "Feature",
  };

  let polygon = '{"coordinates":[[[100,0],[101,0],[101,1],[100,1],[100,0]]],"type":"Polygon"}';
  let file = new File([polygon], "filename.json", { type: "application/json" });
  doTestPolygon("simple polygon", file, expectedGeoJSON);

  polygon = '{"coordinates":[[[100,0],[101,0],[101,1],[100,1],[100,0]],' +
    '[[100.25,0.25],[100.25,0.75],[100.75,0.75],[100.75,0.25],[100.25,0.25]]],"type":"Polygon"}';
  file = new File([polygon], "filename.json", { type: "application/json" });
  doTestPolygon("polygon with holes", file, expectedGeoJSON);

  polygon = '{"type":"MultiPolygon","coordinates":[[[[100,0],[101,0],[101,1],[100,1],[100,0]]],' +
    "[[[102,0],[103,0],[103,1],[102,1],[102,0]]]]}";
  file = new File([polygon], "filename.json", { type: "application/json" });
  doTestPolygon("polygon with holes", file, expectedGeoJSON);

  polygon = '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":' +
    '{"type":"Polygon","coordinates":[[[100,0],[101,0],[101,1],[100,1],[100,0]]]},' +
    '"properties":{}}]}';
  file = new File([polygon], "filename.json", { type: "application/json" });
  doTestPolygon("FeatureCollection", file, expectedGeoJSON);

  polygon = '{"type":"GeometryCollection","geometries":[{"type":"Polygon",' +
    '"coordinates":[[[100,0],[101,0],[101,1],[100,1],[100,0]]]}]}';
  file = new File([polygon], "filename.json", { type: "application/json" });
  doTestPolygon("GeometryCollection", file, expectedGeoJSON);

  polygon = '{"coordinates":[[[100,0],[101,0],[101,1],[100,1],[100,0]]]}';
  file = new File([polygon], "filename.json", { type: "application/json" });
  doTestPolygon("polygon missing type", file,
    { geometry: { coordinates: [], type: "" }, properties: {}, type: "" });

  polygon = '{"coordinates":[[[100,0],[101,0],[101,1],[100,1],[100,0]]],"type":"Weird"}';
  file = new File([polygon], "filename.json", { type: "application/json" });
  doTestPolygon("polygon bad type", file,
    { geometry: { coordinates: [], type: "" }, properties: {}, type: "" });
});

describe("Shapefiles", () => {
  // Shapefiles have polygons in clockwise order.
  const expectedShape = {
    geometry:
    {
      coordinates:
        [[[100, 0], [100, 1], [101, 1], [101, 0], [100, 0]]],
      type: "Polygon",
    },
    properties: {},
    type: "Feature",
  };
  // This is actually a valid .shp shapefile encoded in bytes
  const shape = [0, 0, 39, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 118, 232, 3, 0, 0,
    5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 89, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 89, 64, 0, 0, 0, 0,
    0, 0, 240, 63, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 64, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 89, 64, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 64, 89, 64, 0, 0, 0, 0, 0, 0, 240, 63, 1, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 89, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 89, 64, 0, 0, 0, 0, 0, 0, 240, 63, 0, 0, 0, 0,
    0, 64, 89, 64, 0, 0, 0, 0, 0, 0, 240, 63, 0, 0, 0, 0, 0, 64, 89, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 89, 64, 0, 0, 0, 0, 0, 0, 0, 0];
  const file = new File([new Uint8Array(shape)], "filename.shp", { type: "" });
  doTestPolygon("shapefile with polygon", file, expectedShape);
});
