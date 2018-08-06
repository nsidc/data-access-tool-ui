import { List, Record } from "immutable";
import * as fetchMock from "fetch-mock";
import * as moment from "moment";

import { IGeoJsonBbox, IGeoJsonPolygon } from "../types/GeoJson";
import { getEnvironment } from "./environment";

const __DEV__ = false;  // set to true to test CMR failure case in development

const CMR_URL = "https://cmr.earthdata.nasa.gov";
export const CMR_STATUS_URL = CMR_URL + "/search/health";
const CMR_GRANULE_URL = CMR_URL + "/search/granules.json?page_size=50&provider=NSIDC_ECS&sort_key=short_name";
const CMR_COLLECTION_URL = CMR_URL + "/search/collections.json?page_size=500&provider=NSIDC_ECS&sort_key=short_name";

const cmrHeaders = [
  ["Client-Id", `nsidc-everest-${getEnvironment()}`],
];

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

export const CmrCollection = Record({
  boxes: List(),
  dataset_id: "",
  id: "",
  short_name: "",
  time_end: "",
  time_start: "",
  version_id: "",
});

// make a request with cmrHeaders
// return response.json() on a successful request; reject the Promise otherwise
const cmrFetch = (url: string) => {
  const init = {
    headers: cmrHeaders,
  };

  const onFulfilled = (response: Response) => {
    if (response.ok) {
      return response.json();
    } else {
      return Promise.reject(new Error(`CMR responded with status code ${response.status}; request URL: ${url}`));
    }
  };

  return fetch(url, init).then(onFulfilled);
};

// simulate CMR being down during development; set mockRequests to the number of
// times the status check should fail--1 should be good enough to demo the
// functionality.
let mockedRequests = 0;
const mockRequests = 1;
if (__DEV__) {
  fetchMock.mock(CMR_STATUS_URL, 503);
}

export const cmrStatusRequest = () => {
  const fetchResult = cmrFetch(CMR_STATUS_URL);

  // stop mocking the CMR call and start making real calls
  if (__DEV__) {
    if (++mockedRequests >= mockRequests) {
      fetchMock.restore();
    }
  }

  return fetchResult;
};

export const collectionsRequest = () => {
  return cmrFetch(CMR_COLLECTION_URL);
};

export const cmrGranuleRequest = (collectionId: string,
                                  spatialSelection: IGeoJsonPolygon,
                                  temporalLowerBound: moment.Moment,
                                  temporalUpperBound: moment.Moment) => {
  const URL = CMR_GRANULE_URL
    + `&concept_id=${collectionId}`
    + `&temporal\[\]=${temporalLowerBound.utc().format()},${temporalUpperBound.utc().format()}`
    + spatialParameter(spatialSelection);

  return cmrFetch(URL);
};

export const globalSpatialSelection: IGeoJsonBbox = {
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
export const cmrBoxArrToSpatialSelection = (boxes: string[]): IGeoJsonBbox => {
  if (!boxes) {
    return globalSpatialSelection;
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
};
