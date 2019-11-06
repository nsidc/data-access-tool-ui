import { List } from "immutable";
import * as moment from "moment";

import { BoundingBox } from "../src/types/BoundingBox";
import { CmrCollection } from "../src/types/CmrCollection";
import { OrderParameters } from "../src/types/OrderParameters";
import { mergeOrderParameters } from "../src/utils/orderParameters";

const cmrCollectionA = new CmrCollection({
  boxes: List(["-90 -180 90 180"]),
  dataset_id: "",
  id: "A",
  short_name: "",
  time_end: "",
  time_start: "",
  version_id: "",
});

const cmrCollectionB = new CmrCollection({
  boxes: List(["-90 -180 90 180"]),
  dataset_id: "",
  id: "B",
  short_name: "",
  time_end: "",
  time_start: "",
  version_id: "",
});

describe("mergeOrderParameters", () => {
  test("everything overrides", () => {
    const orderParamsA = new OrderParameters({
      collection: cmrCollectionA,
      temporalFilterLowerBound: moment("20000101"),
      temporalFilterUpperBound: moment("20000102"),
    });
    const orderParamsB = {
      collection: cmrCollectionB,
      temporalFilterLowerBound: moment("20000103"),
      temporalFilterUpperBound: moment("20000104"),
    };

    const actual = mergeOrderParameters(orderParamsA, orderParamsB);

    expect(actual.collection.id).toEqual("B");
    expect(actual.temporalFilterLowerBound).toEqual(moment("20000103"));
    expect(actual.temporalFilterUpperBound).toEqual(moment("20000104"));
  });

  test("params are merged or overridden appropriately", () => {
    const orderParamsA = new OrderParameters({
      collection: cmrCollectionA,
      temporalFilterLowerBound: moment("20000101"),
    });
    const orderParamsB = {
      temporalFilterLowerBound: moment("20000103"),
      temporalFilterUpperBound: moment("20000104"),
    };

    const actual = mergeOrderParameters(orderParamsA, orderParamsB);

    expect(actual.collection.id).toEqual("A");
    expect(actual.temporalFilterLowerBound).toEqual(moment("20000103"));
    expect(actual.temporalFilterUpperBound).toEqual(moment("20000104"));
  });

  test("GeoJSON objects are merged and remain POJOs", () => {
    const globalBbox = BoundingBox.global();

    const nsidc0742Bbox = new BoundingBox(-109, 57, 11, 85);

    const triangle = {
      geometry: {
        coordinates: [[
          [-41.4, 75.1],
          [-76.5, 76.4],
          [-58.5, 70.9],
          [-41.4, 75.1],
        ]],
        type: "Polygon",
      },
      type: "Feature",
    };

    const quadrilateral = {
      geometry: {
        coordinates: [[
          [-98.46, 64.55],
          [-45.32, 70.15],
          [-17.07, 79.00],
          [-106.38, 74.55],
          [-98.46, 64.55],
        ]],
        type: "Polygon",
      },
      type: "Feature",
    };

    const orderParamsA = new OrderParameters({
      collectionSpatialCoverage: globalBbox,
      spatialSelection: triangle,
    });
    const orderParamsB = {
      collectionSpatialCoverage: nsidc0742Bbox,
      spatialSelection: quadrilateral,
    };

    const actual = mergeOrderParameters(orderParamsA, orderParamsB);

    expect(actual.collectionSpatialCoverage).toEqual(nsidc0742Bbox);
    expect(actual.spatialSelection).toEqual(quadrilateral);
  });
});
