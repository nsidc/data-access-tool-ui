import { faUndo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Moment } from "moment";
import * as React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { hasChanged } from "../utils/hasChanged";

interface ITemporalFilterProps {
  fromDate: Moment;
  onFromDateChange: (date: Moment) => void;
  toDate: Moment;
  onToDateChange: (date: Moment) => void;
  onClick: any;
}

export class TemporalFilter extends React.Component<ITemporalFilterProps, {}> {
  public shouldComponentUpdate(nextProps: ITemporalFilterProps) {
    return hasChanged(this.props, nextProps, ["fromDate", "toDate"]);
  }

  public render() {
    // Notes for future CSS warriors: As of this writing, React responds to an
    // attempt to add a container around the labels and DatePicker (i.e., by
    // enclosing them in a div or section) by adding additional markup which
    // makes it really tricky to render the labels and input fields as inline
    // items, while still showing the calendar popups correctly.
    return (
      <div id="temporal-selection">
        <h3>Limit by date:</h3>
        <label className="from">From</label>
        <DatePicker
          id="from"
          maxDate={this.props.toDate}
          selected={this.props.fromDate.utc()}
          dateFormat={["MM/DD/YYYY", "M/D/YYYY"]}
          onChange={(d: Moment) => this.props.onFromDateChange(d.utc())} />
        <label className="to">To</label>
        <DatePicker
          id="to"
          minDate={this.props.fromDate}
          selected={this.props.toDate.utc()}
          dateFormat={["MM/DD/YYYY", "M/D/YYYY"]}
          onChange={(d: Moment) => this.props.onToDateChange(d.utc())} />
        <div onClick={this.props.onClick}>
          <button className="timeReset" data-tip="Reset dates to defaults">
            <FontAwesomeIcon icon={faUndo} size="1x" />
          </button>
        </div>
      </div>
    );
  }
}
