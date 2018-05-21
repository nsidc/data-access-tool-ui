import * as moment from "moment";
import * as React from "react";

import { ISpatialSelection } from "../SpatialSelection";

interface IGranuleListProps {
  collectionId: string;
  spatialSelection: ISpatialSelection;
  temporalFilterLowerBound: moment.Moment | null;
  temporalFilterUpperBound: moment.Moment | null;
  granules: any;
}

export class GranuleList extends React.Component<IGranuleListProps, {}> {
  public render() {
    const granuleList = this.props.granules.map((g: any, i: number) => (
      <tr key={i}>
        <td>{g.producer_granule_id}</td>
        <td>{g.granule_size}</td>
        <td>{g.time_start}</td>
        <td>{g.time_end}</td>
      </tr>
    ));
    return (
      <div>
        <table className="granuleList">
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
