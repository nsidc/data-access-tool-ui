import { List, Record } from "immutable";

export interface ISelectionCriteria {
  includeGranules: List<string>;
}

interface IOrderSubmissionParameters {
  collectionInfo: List<List<string>>;
  selectionCriteria: ISelectionCriteria;
}

const defaultOrderSubmissionParameters = {
  collectionInfo: List<List<string>>(),
  selectionCriteria: {
    includeGranules: List<string>(),
  },
};
const OrderSubmissionParametersRecord = Record(defaultOrderSubmissionParameters);

export class OrderSubmissionParameters extends OrderSubmissionParametersRecord implements IOrderSubmissionParameters {
  public collectionInfo: List<List<string>>;
  public selectionCriteria: ISelectionCriteria;

  constructor(props: IOrderSubmissionParameters = defaultOrderSubmissionParameters) {
    super(props);
  }
}
