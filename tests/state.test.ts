import { List, Map } from "immutable";
import * as moment from "moment";

import { CmrGranule } from "../src/types/CmrGranule";
import { OrderParameters } from "../src/types/OrderParameters";
import { OrderSubmissionParameters } from "../src/types/OrderSubmissionParameters";
import { updateStateAddGranules, updateStateInitGranules } from "../src/utils/state";

const granuleInput = {
  dataset_id: "id1",
  granule_size: "",
  links: List([Map({href: "href1"})]),
  producer_granule_id: "",
  time_end: moment(),
  time_start: moment(),
  title: "Barry",
};

const initialState = {
  cmrGranuleCount: undefined,
  cmrGranuleScrollDepleted: false,
  cmrGranuleScrollId: undefined,
  cmrGranules: List<CmrGranule>(),
  cmrLoadingGranuleInit: false,
  cmrLoadingGranuleScroll: false,
  cmrStatusChecked: false,
  cmrStatusMessage: "",
  cmrStatusOk: false,
  loadedParamsFromLocalStorage: false,
  orderParameters: new OrderParameters(),
  orderSubmissionParameters: undefined,
  stateCanBeFrozen: false,
};

const expected = {
  cmrGranules: List([
    new CmrGranule(granuleInput),
  ]),
  orderSubmissionParameters: new OrderSubmissionParameters({
    collectionInfo: List([List([
      "id1",
      "href1",
    ])]),
    granuleURs: List(["Barry"]),
  }),
};

describe("State updater", () => {
  test("initializes granules", () => {
    const actual = updateStateInitGranules([granuleInput])();

    expect(actual).toEqual(expected);
  });

  test("appends granules", () => {
    const actual = updateStateAddGranules([granuleInput])(initialState);

    expect(actual).toEqual(expected);
  });
});
