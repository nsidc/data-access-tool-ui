import * as React from "react";

class Component extends React.Component {
  displayName = 'GranuleList'

  render() {
    return (
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
    );
  }
}

export default Component;
