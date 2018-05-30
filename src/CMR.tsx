import { ISpatialSelection } from "./SpatialSelection";

import * as moment from "moment";

const CMR_URL = "https://cmr.earthdata.nasa.gov";
const CMR_GRANULE_URL = CMR_URL + "/search/granules.json?page_size=50&provider=NSIDC_ECS&sort_key=short_name";
const CMR_COLLECTION_URL = CMR_URL + "/search/collections.json?page_size=500&provider=NSIDC_ECS&sort_key=short_name";

export const collectionsRequest = () =>
  fetch(CMR_COLLECTION_URL)
      .then((response) => response.json());

export const granuleRequest = (collectionId: string, spatialSelection: ISpatialSelection,
                               temporalLowerBound: moment.Moment, temporalUpperBound: moment.Moment) => {
  const URL = CMR_GRANULE_URL
    + `&concept_id=${collectionId}`
    + `&temporal\[\]=${temporalLowerBound.utc().format()},${temporalUpperBound.utc().format()}`
    + `&bounding_box=${spatialSelection.lower_left_lon},${spatialSelection.lower_left_lat}`
    + `,${spatialSelection.upper_right_lon},${spatialSelection.upper_right_lat}`;
  return fetch(URL)
      .then((response) => response.json());
};
