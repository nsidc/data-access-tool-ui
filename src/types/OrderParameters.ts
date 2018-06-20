import * as moment from "moment";

import { ISpatialSelection } from "./SpatialSelection";

export interface IOrderParameters {
  collection: any;
  collectionId: string;
  spatialSelection: ISpatialSelection;
  temporalFilterLowerBound: moment.Moment;
  temporalFilterUpperBound: moment.Moment;
}
