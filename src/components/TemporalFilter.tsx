import * as moment from "moment";
import * as React from "react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface ITemporalFilterProps {
  fromDate: any;
  onFromDateChange: any;
  toDate: any;
  onToDateChange: any;
}

export class TemporalFilter extends React.Component<ITemporalFilterProps, {}> {
  public constructor(props: ITemporalFilterProps) {
    super(props);
  }

  public render() {
    return (
      <table className="temporal-filter">
        <thead>
          <tr>
            <th>From:</th>
            <th>To:</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <DatePicker
                id="from"
                selected={this.props.fromDate}
                onChange={(d: moment.Moment) => this.props.onFromDateChange(d)} />
            </td>
            <td>
              <DatePicker
                id="to"
                selected={this.props.toDate}
                onChange={(d: moment.Moment) => this.props.onToDateChange(d)} />
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
}
