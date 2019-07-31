import { Record } from "immutable";
import * as moment from "moment";

import { CmrCollection } from "./CmrCollection";
import { IGeoJsonPolygon } from "./GeoJson";

export enum GranuleSorting {
  StartTimeUp = "start_date",
  StartTimeDown = "-start_date",
  EndTimeUp = "end_date",
  EndTimeDown = "-end_date",
  FilenameUp = "producer_granule_id",
  FilenameDown = "-producer_granule_id",
  SizeUp = "data_size",
  SizeDown = "-data_size",
}

export interface IOrderParameters {
  cmrGranuleFilter: string;
  collection: CmrCollection;
  collectionSpatialCoverage: IGeoJsonPolygon | null;
  granuleSorting: GranuleSorting;
  spatialSelection: IGeoJsonPolygon | null;
  temporalFilterLowerBound: moment.Moment;
  temporalFilterUpperBound: moment.Moment;
  timeErrorLowerBound: string;
  timeErrorUpperBound: string;
}

const defaultOrderParameters: IOrderParameters = {
  cmrGranuleFilter: "",
  collection: new CmrCollection(),
  collectionSpatialCoverage: null,
  granuleSorting: GranuleSorting.StartTimeDown,
  spatialSelection: null,
  temporalFilterLowerBound: moment.utc("20100101"),
  temporalFilterUpperBound: moment.utc(),
  timeErrorLowerBound: "",
  timeErrorUpperBound: "",
};
const OrderParametersRecord = Record(defaultOrderParameters);

export class OrderParameters extends OrderParametersRecord implements IOrderParameters {
  public cmrGranuleFilter: string;
  public collection: CmrCollection;
  public collectionSpatialCoverage: IGeoJsonPolygon | null;
  public granuleSorting: GranuleSorting;
  public spatialSelection: IGeoJsonPolygon | null;
  public temporalFilterLowerBound: moment.Moment;
  public temporalFilterUpperBound: moment.Moment;
  public timeErrorLowerBound: string;
  public timeErrorUpperBound: string;

  constructor(props: Partial<IOrderParameters> = defaultOrderParameters) {
    super(props);
  }
}
