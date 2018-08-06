import { Record } from "immutable";

interface ICmrCollection {
  boxes: string[];
  dataset_id: string;
  id: string;
  short_name: string;
  time_end: string;
  time_start: string;
  version_id: string;
}

const defaultCmrCollection = {
  boxes: ["-90 -180 90 180"],
  dataset_id: "",
  id: "",
  short_name: "",
  time_end: "",
  time_start: "",
  version_id: "",
};
const CmrCollectionRecord = Record(defaultCmrCollection);

// tslint:disable:variable-name
// matching the names to how they appear in the CMR JSON response is easier than
// mapping them all to their camelCase equivalents
export class CmrCollection extends CmrCollectionRecord implements ICmrCollection {
  public boxes: string[];
  public dataset_id: string;
  public id: string;
  public short_name: string;
  public time_end: string;
  public time_start: string;
  public version_id: string;

  constructor(props: ICmrCollection = defaultCmrCollection) {
    super(props);
  }
}
