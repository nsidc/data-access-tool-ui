import * as React from "react";

interface GranuleListProps {
  collectionId: string;
  temporalFilterBounds: any;
}

class Component extends React.Component<GranuleListProps, {}> {
  displayName = "GranuleList";

  render() {
    return (
      <div>
        <h3>{"Selected collection: " + this.props.collectionId}</h3>
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
