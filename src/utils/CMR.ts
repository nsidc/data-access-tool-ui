import * as fetchMock from "fetch-mock";
import { List, Map } from "immutable";
import * as moment from "moment";

import { BoundingBox } from "../types/BoundingBox";
import { IGeoJsonPolygon } from "../types/GeoJson";
import { GranuleSorting } from "../types/OrderParameters";
import { getEnvironment } from "./environment";

const __DEV__ = false;  // set to true to test CMR failure case in development

const CMR_PAGE_SIZE = 2000;
export const CMR_MAX_GRANULES = 2000;

// Ops prefers to use UAT in staging so they can be aware of impacts of changes
// making their way in to prod ECS systems.
const CMR_URL = getEnvironment() === "staging" ?
  "https://cmr.uat.earthdata.nasa.gov" :
  "https://cmr.earthdata.nasa.gov";
const CMR_PROVIDER = getEnvironment() === "staging" ? "NSIDC_TS1" : "NSIDC_ECS";
const CMR_COLLECTIONS_URL = CMR_URL + "/search/collections.json?provider=" + CMR_PROVIDER
  + "&page_size=500&sort_key=short_name";
const CMR_COLLECTION_URL = CMR_URL + "/search/collections.json?provider=" + CMR_PROVIDER;
const CMR_GRANULE_URL = CMR_URL + "/search/granules.json";

export const CMR_COUNT_HEADER = "CMR-Hits";
export const CMR_STATUS_URL = CMR_URL + "/search/health";

const CMR_DEFAULT_HEADERS = Map({
  "Client-Id": `nsidc-everest-${getEnvironment()}`,
});

const granuleSortParameter = (granuleSorting: GranuleSorting) => {
  let secondarySort = GranuleSorting.FilenameUp;
  if (granuleSorting === GranuleSorting.FilenameDown || granuleSorting === GranuleSorting.FilenameUp) {
    secondarySort = GranuleSorting.StartTimeDown;
  }
  return "&sort_key\[\]=" + granuleSorting + "&sort_key\[\]=" + secondarySort;
};

// NOTE: Exported for testing only. Un-export once we find a way to test without exporting.
export const spatialParameter = (spatialSelection: IGeoJsonPolygon | null,
                                 boundingBox: number[]): string => {
  let param: string;
  let value: string;

  if (spatialSelection !== null) {
    param = "polygon";
    value = spatialSelection.geometry.coordinates.join(",");
  } else {
    param = "bounding_box";
    value = boundingBox.join(",");
  }

  return `${param}=${value}`;
};

// NOTE: Exported for testing only. Un-export once we find a way to test without exporting.
export const versionParameters = (versionId: number): string => {
  const desiredPadLength = 3;
  const versionLength = String(versionId).length;
  let extraVersionsNeeded = desiredPadLength - versionLength;
  let queryParams = `version=${versionId}`;

  while (extraVersionsNeeded--) {
    const targetLength = desiredPadLength - extraVersionsNeeded;
    const paddedVersionId = String(versionId).padStart(targetLength, "0");
    queryParams += `&version=${paddedVersionId}`;
  }

  return queryParams;
};

export const filterAddWildcards = (filter: string): string => {
  if (!filter.startsWith("*")) { filter = "*" + filter; }
  if (!filter.endsWith("*")) { filter += "*"; }
  return filter;
};

const combineGranuleFilters = (cmrGranuleFilter: string, separator: string, filterPrefix: string): string => {
  const multipleFilters: string[] = [];
  // Remove whitespace and see if we have multiple filters separated by commas
  cmrGranuleFilter.replace(/\s*/g, "").split(",").forEach((singleFilter: string) => {
    if (singleFilter.length > 0) {
      singleFilter = filterPrefix + filterAddWildcards(singleFilter);
      multipleFilters.push(singleFilter);
    }
  });
  return multipleFilters.join(separator);
};

export const earthdataGranuleFilterParameters = (cmrGranuleFilter: string): string => {
  // Earthdata expects a single parameter separated by !'s
  let result = combineGranuleFilters(cmrGranuleFilter, "!", "");
  if (result.length > 0) {
    result = "&pg[0][id]=" + result;
  }
  return result;
};

const cmrGranuleFilterParameters = (cmrGranuleFilter: string): string => {
  // CMR expects multiple parameters, one for each pattern
  let result = combineGranuleFilters(cmrGranuleFilter, "", "&producer_granule_id[]=");
  if (result.length > 0) {
    result = "&options[producer_granule_id][pattern]=true" + result;
  }
  return result;
};

// make a request with CMR headers
// return response.json() on a successful request; reject the Promise otherwise
const cmrFetch = (url: string, headers: Map<string, string> = Map()) => {
  const init = {
    headers: List(CMR_DEFAULT_HEADERS.merge(headers)).toJS(),
  };

  const onFulfilled = (response: Response) => {
    if (response.ok) {
      return Promise.resolve(response);
    } else {
      return Promise.reject(response);
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
  const fetchResult = cmrFetch(CMR_STATUS_URL).then((response: Response) => response.json());

  // stop mocking the CMR call and start making real calls
  if (__DEV__) {
    if (++mockedRequests >= mockRequests) {
      fetchMock.restore();
    }
  }

  return fetchResult;
};

export const cmrEcsCollectionsRequest = () => {
  return cmrFetch(CMR_COLLECTIONS_URL).then((response: Response) => response.json());
};

export const cmrCollectionRequest = (shortName: string, version: number) => {
  const collectionUrl = CMR_COLLECTION_URL
    + `&short_name=${shortName}`
    + `&${versionParameters(version)}`;
  return cmrFetch(collectionUrl).then((response: Response) => response.json());
};

export const cmrGranuleRequest = (collectionAuthId: string,
                                  collectionVersionId: number,
                                  spatialSelection: IGeoJsonPolygon | null,
                                  boundingBox: BoundingBox,
                                  temporalLowerBound: moment.Moment,
                                  temporalUpperBound: moment.Moment,
                                  cmrGranuleFilter: string,
                                  granuleSorting: GranuleSorting,
                                  headers?: Map<string, string>) => {
  let URL = CMR_GRANULE_URL
    + `?provider=${CMR_PROVIDER}`
    + `&page_size=${CMR_PAGE_SIZE}`
    + `${granuleSortParameter(granuleSorting)}`
    + `&short_name=${collectionAuthId}`
    + `&${versionParameters(collectionVersionId)}`
    + `&temporal\[\]=${temporalLowerBound.utc().format()},${temporalUpperBound.utc().format()}`
    + `&${spatialParameter(spatialSelection, boundingBox.rect)}`;

  if (cmrGranuleFilter !== "") {
    URL += cmrGranuleFilterParameters(cmrGranuleFilter);
  }
  return cmrFetch(URL, headers);
};

// take the list of bounding boxes from a CMR response
// (e.g., ["-90 -180 90 180"]) and return a geoJSON SpatialSelection
// encompassing them all
//
// TODO: Kevin's ideas for refactoring
// https://bitbucket.org/nsidc/everest-ui/pull-requests/179/hermes-92-point-data/activity#comment-112353646
export const cmrBoxArrToSpatialSelection = (boxes: string[] | List<string>) => {
  if (((boxes as string[]).length === 0) || ((boxes as List<string>).size === 0)) {
    return BoundingBox.global();
  }

  const souths: number[] = [];
  const wests: number[] = [];
  const norths: number[] = [];
  const easts: number[] = [];

  const boxesList: List<string> = boxes instanceof Array ? List(boxes) : boxes;

  boxesList.forEach((box: string = "-90 -180 90 180") => {
    const [south, west, north, east]: number[] = box.split(" ").map(parseFloat);

    souths.push(south);
    wests.push(west);
    norths.push(north);
    easts.push(east);
  });

  const finalWest: number = Math.min.apply(null, wests);
  const finalSouth: number = Math.min.apply(null, souths);
  const finalEast: number = Math.max.apply(null, easts);
  const finalNorth: number = Math.max.apply(null, norths);

  return new BoundingBox(finalWest, finalSouth, finalEast, finalNorth);
};

export const formatBytes = (bytes: number): string => {
  if (bytes <= 0) {
    return "0 MB";
  }
  const k = 1024;
  const sizes = ["MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  // Keep values < 2*size in the smaller units
  const offset = Math.log(2) / Math.log(k);
  let i = Math.floor(Math.log(bytes) / Math.log(k) - offset);
  i = Math.min(Math.max(i, 0), 6);
  const value = bytes / Math.pow(k, i);
  // Use parseFloat to get rid of scientific notation from toPrecision
  return parseFloat(value.toPrecision(2)) + " " + sizes[i];
};

export const boundingBoxMatch = (bbox1: BoundingBox, bbox2: BoundingBox) => {
  const bboxMatch = JSON.stringify(bbox1) === JSON.stringify(bbox2);
  return bboxMatch;
};
