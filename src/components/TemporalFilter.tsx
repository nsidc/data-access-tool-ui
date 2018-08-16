import * as moment from "moment";
import * as React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { hasChanged } from "../utils/hasChanged";

interface ITemporalFilterProps {
  fromDate: any;
  onFromDateChange: any;
  toDate: any;
  onToDateChange: any;
}

export class TemporalFilter extends React.Component<ITemporalFilterProps, {}> {
  public shouldComponentUpdate(nextProps: ITemporalFilterProps) {
    return hasChanged(this.props, nextProps, ["fromDate", "toDate"]);
  }

  public render() {
    return (
      <div id="temporal-selection">
        <h3>Limit by date:</h3>
        <label className="from">From</label>
        <DatePicker
          id="from"
          selected={this.props.fromDate}
          onChange={(d: moment.Moment) => this.props.onFromDateChange(d)} />
        <label>To</label>
        <DatePicker
          id="to"
          selected={this.props.toDate}
          onChange={(d: moment.Moment) => this.props.onToDateChange(d)} />
      </div>
    );
  }
}
