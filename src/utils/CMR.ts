import * as moment from "moment";

import { ISpatialSelection } from "../types/SpatialSelection";

const CMR_URL = "https://cmr.earthdata.nasa.gov";
const CMR_GRANULE_URL = CMR_URL + "/search/granules.json?page_size=50&provider=NSIDC_ECS&sort_key=short_name";
const CMR_COLLECTION_URL = CMR_URL + "/search/collections.json?page_size=500&provider=NSIDC_ECS&sort_key=short_name";

const spatialParameter = (geoJSON: any): string => {
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
                               spatialSelection: ISpatialSelection,
                               temporalLowerBound: moment.Moment,
                               temporalUpperBound: moment.Moment) => {
  const URL = CMR_GRANULE_URL
    + `&concept_id=${collectionId}`
    + `&temporal\[\]=${temporalLowerBound.utc().format()},${temporalUpperBound.utc().format()}`
    + spatialParameter(spatialSelection);
  return fetch(URL)
      .then((response) => response.json());
};
