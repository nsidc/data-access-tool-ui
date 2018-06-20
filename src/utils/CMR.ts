import * as moment from "moment";

import { IGeoJsonBbox, IGeoJsonPolygon } from "../types/GeoJson";

const CMR_URL = "https://cmr.earthdata.nasa.gov";
const CMR_GRANULE_URL = CMR_URL + "/search/granules.json?page_size=50&provider=NSIDC_ECS&sort_key=short_name";
const CMR_COLLECTION_URL = CMR_URL + "/search/collections.json?page_size=500&provider=NSIDC_ECS&sort_key=short_name";

const spatialParameter = (geoJSON: IGeoJsonPolygon): string => {
  let param: string;
  let value: string;

  if (geoJSON && geoJSON.hasOwnProperty("bbox")) {
    param = "bounding_box";
    value = geoJSON.bbox.join(",");

  } else if (geoJSON && geoJSON.geometry && (geoJSON.geometry.type === "Polygon")) {
    param = "polygon";
    value = geoJSON.geometry.coordinates.join(",");

  } else {
    return "";
  }

  return `&${param}=${value}`;
};

export const collectionsRequest = () =>
  fetch(CMR_COLLECTION_URL)
      .then((response) => response.json());

export const granuleRequest = (collectionId: string,
                               spatialSelection: IGeoJsonPolygon,
                               temporalLowerBound: moment.Moment,
                               temporalUpperBound: moment.Moment) => {
  const URL = CMR_GRANULE_URL
    + `&concept_id=${collectionId}`
    + `&temporal\[\]=${temporalLowerBound.utc().format()},${temporalUpperBound.utc().format()}`
    + spatialParameter(spatialSelection);
  return fetch(URL)
      .then((response) => response.json());
};

export const defaultSpatialSelection: IGeoJsonBbox = {
  bbox: [-180, -90, 180, 90],
  geometry: {
    coordinates: [[
      [-180, -90],
      [180, -90],
      [180, 90],
      [-180, 90],
      [-180, -90],
    ]],
    type: "Polygon",
  },
  type: "Feature",
};

// take the list of bounding boxes from a CMR response
// (e.g., ["-90 -180 90 180"]) and return a geoJSON SpatialSelection
// encompassing them all
export function boundingBoxesToGeoJSON(boxes: string[]): IGeoJsonBbox {
  if (!boxes) {
    return defaultSpatialSelection;
  }

  const souths: number[] = [];
  const wests: number[] = [];
  const norths: number[] = [];
  const easts: number[] = [];

  boxes.forEach((box: string) => {
    const coords: number[] = box.split(" ")
                                .map(parseFloat)
                                .map((f) => f.toFixed(2))
                                .map(parseFloat);
    souths.push(coords[0]);
    wests.push(coords[1]);
    norths.push(coords[2]);
    easts.push(coords[3]);
  });

  const finalWest: number = Math.min.apply(null, wests);
  const finalSouth: number = Math.min.apply(null, souths);
  const finalEast: number = Math.max.apply(null, easts);
  const finalNorth: number = Math.max.apply(null, norths);

  return {
    bbox: [finalWest, finalSouth, finalEast, finalNorth],
    geometry: {
      coordinates: [[
        [finalWest, finalSouth],
        [finalEast, finalSouth],
        [finalEast, finalNorth],
        [finalWest, finalNorth],
        [finalWest, finalSouth],
      ]],
      type: "Polygon",
    },
    type: "Feature",
  };
}
