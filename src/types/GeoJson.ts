// http://wiki.geojson.org/GeoJSON_draft_version_6

interface IGeoJsonPointCoords extends Array<number> {}

interface IGeoJsonLineStringCoords extends Array<IGeoJsonPointCoords> {}

// to fully folllow the GeoJSON spec, Polygon Coords would extend an array of
// LinearRing coords; a LinearRing is a special case of LineString where the
// first and last points are equivalent
interface IGeoJsonPolygonCoords extends Array<IGeoJsonLineStringCoords> {}

export interface IGeoJsonPolygonGeometry {
  readonly coordinates: IGeoJsonPolygonCoords;
  readonly type: string;
}

export interface IGeoJsonPolygon {
  readonly geometry: IGeoJsonPolygonGeometry;
  readonly type: string;
  [propName: string]: any;
}
