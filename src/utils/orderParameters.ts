import { IOrderParameters, OrderParameters } from "../types/OrderParameters";

export const mergeOrderParameters = (orderParamsA: OrderParameters,
                                     orderParamsB: Partial<IOrderParameters>) => {
  // Immutable's typing for Record is incorrect; Record#merge returns a
  // Record with the same attributes, but the type definition says it
  // returns a Map (OrderParameters is a subclass of Record)
  //
  // @ts-ignore 2322
  let orderParameters: OrderParameters = orderParamsA.merge(orderParamsB);

  let spatialSelection = orderParameters.spatialSelection;
  if (orderParamsB.spatialSelection) {
    spatialSelection = orderParamsB.spatialSelection;
  }

  let collectionSpatialCoverage = orderParameters.collectionSpatialCoverage;
  if (orderParamsB.collectionSpatialCoverage) {
    collectionSpatialCoverage = orderParamsB.collectionSpatialCoverage;
  }

  // ensure the GeoJSON polygons are POJOS; with the .merge() call above,
  // they are converted to Immutable Maps
  orderParameters = new OrderParameters({
    boundingBox: Array.from(orderParameters.boundingBox),
    cmrGranuleFilter: orderParameters.cmrGranuleFilter,
    collection: orderParameters.collection,
    collectionSpatialCoverage,
    granuleSorting: orderParameters.granuleSorting,
    spatialSelection,
    temporalFilterLowerBound: orderParameters.temporalFilterLowerBound,
    temporalFilterUpperBound: orderParameters.temporalFilterUpperBound,
  });

  return orderParameters;
};
