import * as moment from "moment";

import { ISpatialSelection } from "./SpatialSelection";

export interface IOrderParameters {
  selectedCollection: any;
  selectedCollectionId: string;
  spatialSelection: ISpatialSelection;
  temporalFilterLowerBound: moment.Moment;
  temporalFilterUpperBound: moment.Moment;
}
