import { List, Map } from "immutable";
import * as moment from "moment";

import { CmrGranule } from "../src/types/CmrGranule";
import { OrderParameters } from "../src/types/OrderParameters";
import { OrderSubmissionParameters } from "../src/types/OrderSubmissionParameters";
import { EverestUserUnknownStatus } from "../src/types/User";
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
  cmrGranuleFilter: "",
  cmrGranules: List<CmrGranule>(),
  cmrLoadingGranules: false,
  cmrStatusChecked: false,
  cmrStatusMessage: "",
  cmrStatusOk: false,
  loadedParamsFromLocalStorage: false,
  orderParameters: new OrderParameters(),
  orderSubmissionParameters: undefined,
  stateCanBeFrozen: false,
  totalSize: 0,
  user: EverestUserUnknownStatus,
};

const expected = {
  cmrGranules: List([
    new CmrGranule(granuleInput),
  ]),
  orderSubmissionParameters: new OrderSubmissionParameters({
    selectionCriteria: {
      includeGranules: List(["Barry"]),
    },
  }),
  totalSize: 0,
};

describe("State updater", () => {
  test("initializes granules", () => {
    const actual = updateStateInitGranules([granuleInput], 0)();

    expect(actual).toEqual(expected);
  });

  test("appends granules", () => {
    const actual = updateStateAddGranules([granuleInput], 0)(initialState);

    expect(actual).toEqual(expected);
  });
});
