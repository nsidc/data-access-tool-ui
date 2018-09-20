import { Record } from "immutable";
import * as moment from "moment";

import { CmrCollection } from "./CmrCollection";
import { IGeoJsonPolygon } from "./GeoJson";

export interface IOrderParameters {
  collection: CmrCollection;
  collectionSpatialCoverage: IGeoJsonPolygon | null;
  spatialSelection: IGeoJsonPolygon | null;
  temporalFilterLowerBound: moment.Moment;
  temporalFilterUpperBound: moment.Moment;
}

const defaultOrderParameters: IOrderParameters = {
  collection: new CmrCollection(),
  collectionSpatialCoverage: null,
  spatialSelection: null,
  temporalFilterLowerBound: moment("20100101"),
  temporalFilterUpperBound: moment(),
};
const OrderParametersRecord = Record(defaultOrderParameters);

export class OrderParameters extends OrderParametersRecord implements IOrderParameters {
  public collection!: CmrCollection;
  public collectionSpatialCoverage!: IGeoJsonPolygon | null;
  public spatialSelection!: IGeoJsonPolygon | null;
  public temporalFilterLowerBound!: moment.Moment;
  public temporalFilterUpperBound!: moment.Moment;

  constructor(props: Partial<IOrderParameters> = defaultOrderParameters) {
    super(props);
  }
}
