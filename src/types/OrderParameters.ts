import * as moment from "moment";

import { IGeoJsonPolygon } from "./GeoJson";

export interface IOrderParameters {
  collection: any;
  collectionId: string;
  spatialSelection: IGeoJsonPolygon;
  temporalFilterLowerBound: moment.Moment;
  temporalFilterUpperBound: moment.Moment;
}
