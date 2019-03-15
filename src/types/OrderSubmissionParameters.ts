import { List, Record } from "immutable";

export interface ISelectionCriteria {
  includeGranules: List<string>;
}

interface IOrderSubmissionParameters {
  selectionCriteria: ISelectionCriteria;
}

const defaultOrderSubmissionParameters = {
  selectionCriteria: {
    includeGranules: List<string>(),
  },
};
const OrderSubmissionParametersRecord = Record(defaultOrderSubmissionParameters);

export class OrderSubmissionParameters extends OrderSubmissionParametersRecord implements IOrderSubmissionParameters {
  public selectionCriteria: ISelectionCriteria;

  constructor(props: IOrderSubmissionParameters = defaultOrderSubmissionParameters) {
    super(props);
  }
}
