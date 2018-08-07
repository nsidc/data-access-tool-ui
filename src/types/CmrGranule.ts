import { List, Map, Record } from "immutable";
import * as moment from "moment";

export interface ICmrGranule {
  dataset_id: string;
  granule_size: string;
  links: List<Map<string, string>>;
  producer_granule_id: string;
  time_end: moment.Moment;
  time_start: moment.Moment;
  title: string;
}

const defaultCmrGranule = {
  dataset_id: "",
  granule_size: "",
  links: List<Map<string, string>>(),
  producer_granule_id: "",
  time_end: moment(),
  time_start: moment(),
  title: "",
};
const CmrGranuleRecord = Record(defaultCmrGranule);

// tslint:disable:variable-name
// matching the names to how they appear in the CMR JSON response is easier than
// mapping them all to their camelCase equivalents
export class CmrGranule extends CmrGranuleRecord implements ICmrGranule, Object {
  public dataset_id: string;
  public granule_size: string;
  public links: List<Map<string, string>>;
  public producer_granule_id: string;
  public time_end: moment.Moment;
  public time_start: moment.Moment;
  public title: string;

  constructor(props: ICmrGranule = defaultCmrGranule) {
    super(props);
  }
}
