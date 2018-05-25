import * as moment from "moment";
import * as React from "react";

interface IGranuleListProps {
  collectionId: string;
  granules: any;
}

export class GranuleList extends React.Component<IGranuleListProps, {}> {
  private static timeFormat = "YYYY-MM-DD HH:mm:ss";

  public render() {
    const granuleList = this.props.granules.map((g: any, i: number) => (
      <tr key={i}>
        <td>{g.producer_granule_id}</td>
        <td>{parseFloat(g.granule_size).toFixed(1)}</td>
        <td>{moment(g.time_start).format(GranuleList.timeFormat)}</td>
        <td>{moment(g.time_end).format(GranuleList.timeFormat)}</td>
      </tr>
    ));
    return (
      <div>
        <table className="granuleList">
          <col className="granule-id-col"/>
          <col className="size-col"/>
          <col className="start-time-col"/>
          <col className="end-time-col"/>
          <thead>
            <tr>
              <th>Granule ID</th>
              <th>Size (MB)</th>
              <th>Start Time</th>
              <th>End Time</th>
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
