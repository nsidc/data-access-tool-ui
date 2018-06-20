import * as moment from "moment";
import * as React from "react";

interface IGranuleListProps {
  collectionId: string;
  cmrResponse?: object[];
}

export class GranuleList extends React.Component<IGranuleListProps, {}> {
  private static timeFormat = "YYYY-MM-DD HH:mm:ss";

  public render() {
    let granuleList: object[] = [];
    if (this.props.cmrResponse) {
      granuleList = this.props.cmrResponse.map((g: any, i: number) => (
        <tr key={i}>
          <td>{g.producer_granule_id}</td>
          <td>{parseFloat(g.granule_size).toFixed(1)}</td>
          <td>{moment(g.time_start).format(GranuleList.timeFormat)}</td>
          <td>{moment(g.time_end).format(GranuleList.timeFormat)}</td>
        </tr>
      ));
    }
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
