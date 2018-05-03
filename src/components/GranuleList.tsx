import * as moment from "moment";
import * as React from "react";

interface GranuleListProps {
  collectionId: string;
  temporalFilterLowerBound: moment.Moment | null;
  temporalFilterUpperBound: moment.Moment | null;
}

class Component extends React.Component<GranuleListProps, {}> {
  displayName = "GranuleList";

  dateString(date: moment.Moment | null) {
    if (date) {
      return date.toString();
    } else {
      return "Please input a date";
    }
  }

  render() {
    return (
      <div>
        <h3>{"Selected collection: " + this.props.collectionId}</h3>
        <div>
          {"Temporal bounds: "
          + this.dateString(this.props.temporalFilterLowerBound) + ", "
          + this.dateString(this.props.temporalFilterUpperBound)}
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>ID</th>
              <th>Summary</th>
              <th>Granules</th>
            </tr>
          </thead>
          <tbody>
          </tbody>
        </table>
      </div>
    );
  }
}

export default Component;
