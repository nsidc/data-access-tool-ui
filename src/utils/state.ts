import { fromJS, List } from "immutable";

import { IEverestState } from "../components/EverestUI";
import { CmrGranule, ICmrGranule } from "../types/CmrGranule";
import { OrderSubmissionParameters } from "../types/OrderSubmissionParameters";

const orderSubmissionParametersFromCmrGranules = (cmrGranules: List<CmrGranule>) => {
  const granules = cmrGranules.map((g) => g!.title) as List<string>;
  const selectionCriteria = {includeGranules: granules};

  return new OrderSubmissionParameters({selectionCriteria});
};

export const updateStateInitGranules = (granules: any[]) => {
  return () => {
    const cmrGranules = fromJS(granules).map((e: ICmrGranule) => new CmrGranule(e));
    const orderSubmissionParameters = orderSubmissionParametersFromCmrGranules(cmrGranules);

    return {cmrGranules, orderSubmissionParameters};
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
