import { fromJS, List } from "immutable";

import { IEverestState } from "../components/EverestUI";
import { CmrGranule, ICmrGranule } from "../types/CmrGranule";
import { OrderSubmissionParameters } from "../types/OrderSubmissionParameters";

export const updateStateAddGranules = (newGranules: List<ICmrGranule>) => (state: IEverestState) => {
  const newCmrGranules = fromJS(newGranules).map((g: ICmrGranule) => new CmrGranule(g));
  const cmrGranules = state.cmrGranules.concat(newCmrGranules) as List<CmrGranule>;

  const granuleURs = cmrGranules.map((g) => g!.title) as List<string>;
  const collectionIDs = cmrGranules.map((g) => g!.dataset_id) as List<string>;
  const collectionLinks = cmrGranules.map((g) => g!.links.last().get("href")) as List<string>;
  const collectionInfo = collectionIDs.map((id, key) => List([id!, collectionLinks.get(key!)])) as List<List<string>>;
  const orderSubmissionParameters = new OrderSubmissionParameters({collectionInfo, granuleURs});

  return {cmrGranules, orderSubmissionParameters};
};
