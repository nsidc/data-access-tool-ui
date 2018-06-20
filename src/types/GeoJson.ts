// http://wiki.geojson.org/GeoJSON_draft_version_6

interface IGeoJsonPointCoords extends Array<number> {}

interface IGeoJsonLineStringCoords extends Array<IGeoJsonPointCoords> {}

// to fully folllow the GeoJSON spec, Polygon Coords would extend an array of
// LinearRing coords; a LinearRing is a special case of LineString where the
// first and last points are equivalent
interface IGeoJsonPolygonCoords extends Array<IGeoJsonLineStringCoords> {}

interface IGeoJsonPolygonGeometry {
  readonly coordinates: IGeoJsonPolygonCoords;
  readonly type: string;
}

export interface IGeoJsonPolygon {
  readonly geometry: IGeoJsonPolygonGeometry;
  readonly type: string;
  [propName: string]: any;
}

// to fully follow the GeoJSON spec, a Bbox would be a polygon made of just one
// LinearRing containing exactly 4 unique points, and the values of the points
// would match the values of the bbox; with this interface, we ensure roughly
// the right structure, but cannot validate the values
export interface IGeoJsonBbox extends IGeoJsonPolygon {
  readonly bbox: [number, number, number, number];
}
