import { List, Record } from "immutable";

interface IOrderSubmissionParameters {
  collectionInfo: List<any>;
  granuleURs: List<string>;
}

const defaultOrderSubmissionParameters = {
  collectionInfo: List(),
  granuleURs: List<string>(),
};
const OrderSubmissionParametersRecord = Record(defaultOrderSubmissionParameters);

export class OrderSubmissionParameters extends OrderSubmissionParametersRecord implements IOrderSubmissionParameters {
  public collectionInfo: List<any>;
  public granuleURs: List<string>;

  constructor(props: IOrderSubmissionParameters = defaultOrderSubmissionParameters) {
    super(props);
  }
}
