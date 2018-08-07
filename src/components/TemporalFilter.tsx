import * as moment from "moment";
import * as React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { genericShouldUpdate } from "../utils/shouldUpdate";

interface ITemporalFilterProps {
  fromDate: any;
  onFromDateChange: any;
  toDate: any;
  onToDateChange: any;
}

export class TemporalFilter extends React.Component<ITemporalFilterProps, {}> {
  public shouldComponentUpdate(nextProps: ITemporalFilterProps) {
    return genericShouldUpdate({
      currentProps: this.props,
      nextProps,
      propsToCheck: ["fromDate", "toDate"],
    });
  }

  public render() {
    return (
      <div id="temporal-selection">
        <label>From:</label>
        <DatePicker
          id="from"
          selected={this.props.fromDate}
          onChange={(d: moment.Moment) => this.props.onFromDateChange(d)} />
        <label>To:</label>
        <DatePicker
          id="to"
          selected={this.props.toDate}
          onChange={(d: moment.Moment) => this.props.onToDateChange(d)} />
      </div>
    );
  }
}
