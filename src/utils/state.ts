import { fromJS, List } from "immutable";

import { IEverestState } from "../components/EverestUI";
import { CmrGranule, ICmrGranule } from "../types/CmrGranule";
import { OrderSubmissionParameters } from "../types/OrderSubmissionParameters";

const orderSubmissionParametersFromCmrGranules = (cmrGranules: List<CmrGranule>) => {
  const granules = cmrGranules.map((g) => g!.title) as List<string>;
  const selectionCriteria = {includeGranules: granules};

  return new OrderSubmissionParameters({selectionCriteria});
};

export const updateStateInitGranules = (granules: any[], cmrGranuleCount: number) => {
  return () => {
    const cmrGranules: List<CmrGranule> = fromJS(granules).map((e: ICmrGranule) => new CmrGranule(e));
    const orderSubmissionParameters = orderSubmissionParametersFromCmrGranules(cmrGranules);
    let totalSize = 0;
    if (cmrGranuleCount > 0 && cmrGranules.size) {
      // Convert to JS to avoid all of the Immutable undefined's.
      // TODO: Update when Immutable 4 is released and installed
      const sizes = cmrGranules.map((granule) => parseFloat(granule!.granule_size)).toJS();
      totalSize = sizes.reduce((value: number, s: number) => {
        value += s;
        return value;
        }, 0);
      // Estimate the size based on the first "page" of results
      totalSize = totalSize / cmrGranules.size * cmrGranuleCount;
    }

    return {cmrGranules, orderSubmissionParameters, totalSize};
  };
};

export const updateStateAddGranules = (newGranules: any[]) => {
  return (state: IEverestState) => {
    const newCmrGranules = fromJS(newGranules).map((g: ICmrGranule) => new CmrGranule(g));
    const cmrGranules = state.cmrGranules.concat(newCmrGranules) as List<CmrGranule>;
    const orderSubmissionParameters = orderSubmissionParametersFromCmrGranules(cmrGranules);

    return {cmrGranules, orderSubmissionParameters};
  };
};
