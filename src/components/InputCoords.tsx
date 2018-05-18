import * as React from "react";

interface InputCoordsProps {
  onCoordChange: any;
  selectedCoords: any;
}

export class InputCoords extends React.Component<InputCoordsProps, {}> {
  public constructor(props: any) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  public render() {
    return (
      <table>
        <thead>
          <tr>
            <th>Lower Left</th>
            <th>Upper Right</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Lon:
              <input required
                     id="lower_left_lon"
                     value={this.props.selectedCoords.lower_left_lon}
                     onChange={this.handleChange} />
            </td>
            <td>Lon:
              <input required
                     id="upper_right_lon"
                     value={this.props.selectedCoords.upper_right_lon}
                     onChange={this.handleChange} />
            </td>
          </tr>
          <tr>
            <td>Lat:
              <input required
                     id="lower_left_lat"
                     value={this.props.selectedCoords.lower_left_lat}
                     onChange={this.handleChange} />
            </td>
            <td>Lat:
              <input required
                     id="upper_right_lat"
                     value={this.props.selectedCoords.upper_right_lat}
                     onChange={this.handleChange} />
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  private handleChange(e: any) {
    const selectedCoords = this.props.selectedCoords;
    selectedCoords[e.target.id] = e.target.value;
    this.props.onCoordChange(selectedCoords);
  }
}
