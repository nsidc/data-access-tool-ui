import { List } from "immutable";
import * as moment from "moment";
import * as React from "react";

interface IGranuleListProps {
  cmrResponse: List<object>;
}

export class GranuleList extends React.Component<IGranuleListProps, {}> {
  private static timeFormat = "YYYY-MM-DD HH:mm:ss";

  public shouldComponentUpdate(nextProps: IGranuleListProps) {
    return !this.props.cmrResponse.equals(nextProps.cmrResponse);
  }

  public render() {
    const granuleList = this.props.cmrResponse.map((granule: any, i?: number) => (
      <tr key={i}>
        <td>{granule.get("producer_granule_id")}</td>
        <td>{parseFloat(granule.get("granule_size")).toFixed(1)}</td>
        <td>{moment(granule.get("time_start")).format(GranuleList.timeFormat)}</td>
        <td>{moment(granule.get("time_end")).format(GranuleList.timeFormat)}</td>
      </tr>
    ));

    return (
      <div id="granule-list">
        <table className="granuleList">
          <thead>
            <tr>
              <th className="granule-id-col">Granule ID</th>
              <th className="size-col">Size (MB)</th>
              <th className="start-time-col">Start Time</th>
              <th className="end-time-col">End Time</th>
            </tr>
          </thead>
          <tbody>
            {granuleList}
          </tbody>
        </table>
      </div>
    );
  }
}
