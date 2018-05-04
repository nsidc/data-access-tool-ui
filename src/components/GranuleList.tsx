import * as moment from "moment";
import * as React from "react";

import { SpatialSelection } from "../SpatialSelection";

interface GranuleListProps {
  collectionId: string;
  spatialSelection: SpatialSelection;
  temporalFilterLowerBound: moment.Moment | null;
  temporalFilterUpperBound: moment.Moment | null;
  granules: any;
}

export class GranuleList extends React.Component<GranuleListProps, {}> {
  displayName = "GranuleList";

  dateString(date: moment.Moment | null) {
    if (date) {
      return date.toString();
    } else {
      return "Please input a date";
    }
  }

  render() {
    const granuleList = this.props.granules.map((g: any) => (
      <tr>
        <td>{g.producer_granule_id}</td>
        <td>{g.granule_size}</td>
        <td>{g.time_start}</td>
        <td>{g.time_end}</td>
      </tr>
    ));
    return (
      <div>
        <h3>{"Selected collection: " + this.props.collectionId}</h3>
        <div>
          {"Temporal bounds: "
          + this.dateString(this.props.temporalFilterLowerBound) + ", "
          + this.dateString(this.props.temporalFilterUpperBound)}
        </div>
        <div>
          {"Spatial bounds: ["
          + this.props.spatialSelection.lower_left_lat + ", "
          + this.props.spatialSelection.lower_left_lon + "], ["
          + this.props.spatialSelection.upper_right_lat + ", "
          + this.props.spatialSelection.upper_right_lon + "]"}
        </div>
        <table>
          <thead>
            <tr>
              <th>Granule ID</th>
              <th>Size (Hectares)</th>
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
