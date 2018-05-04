import * as moment from "moment";
import * as React from "react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface TemporalFilterProps {
  onDateChange: any;
  selectedDate: any;
}

export class TemporalFilter extends React.Component<TemporalFilterProps, {}> {
  displayName = "TemporalFilter";

  constructor(props: any) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(date: moment.Moment | null) {
    this.props.onDateChange(date);
  }

  render() {
    return (
      <div className="temporalfilter-container">
        <DatePicker selected={this.props.selectedDate} onChange={this.handleChange} />
      </div>
    );
  }
}
