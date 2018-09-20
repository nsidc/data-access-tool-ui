import { List, Record } from "immutable";

interface IOrderSubmissionParameters {
  collectionInfo: List<List<string>>;
  granuleURs: List<string>;
}

const defaultOrderSubmissionParameters = {
  collectionInfo: List<List<string>>(),
  granuleURs: List<string>(),
};
const OrderSubmissionParametersRecord = Record(defaultOrderSubmissionParameters);

export class OrderSubmissionParameters extends OrderSubmissionParametersRecord implements IOrderSubmissionParameters {
  public collectionInfo!: List<List<string>>;
  public granuleURs!: List<string>;

  constructor(props: IOrderSubmissionParameters = defaultOrderSubmissionParameters) {
    super(props);
  }
}
