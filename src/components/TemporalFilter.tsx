import * as moment from "moment";
import * as React from "react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface ITemporalFilterProps {
  onDateChange: any;
  selectedDate: any;
}

export class TemporalFilter extends React.Component<ITemporalFilterProps, {}> {
  public constructor(props: ITemporalFilterProps) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  public render() {
    return (
      <div className="temporalfilter-container">
        <DatePicker selected={this.props.selectedDate} onChange={this.handleChange} />
      </div>
    );
  }

  private handleChange(date: moment.Moment) {
    this.props.onDateChange(date);
  }
}
