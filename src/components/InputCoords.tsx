import * as React from "react";

interface InputCoordsProps {
  onCoordChange: any;
  selectedCoords: any;
}

function spatialInputIsValid(spatialInput: any): boolean {
  const min = Number(spatialInput.min);
  const max = Number(spatialInput.max);
  const spatialValue = Number(spatialInput.value);
  return spatialValue >= min && spatialValue <= max;
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
            <th colSpan={2}>Lower Left</th>
            <th colSpan={2}>Upper Right</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Lon:
              <input type="number"
                     min={-180}
                     max={180}
                     step={0.01}
                     id="lower_left_lon"
                     value={this.props.selectedCoords.lower_left_lon}
                     onChange={this.handleChange} />
            </td>
            <td>Lat:
              <input type="number"
                     min={-90}
                     max={90}
                     step={0.01}
                     id="lower_left_lat"
                     value={this.props.selectedCoords.lower_left_lat}
                     onChange={this.handleChange} />
            </td>
            <td>Lon:
              <input type="number"
                     min={-180}
                     max={180}
                     step={0.01}
                     id="upper_right_lon"
                     value={this.props.selectedCoords.upper_right_lon}
                     onChange={this.handleChange} />
            </td>
            <td>Lat:
              <input type="number"
                     min={-90}
                     max={90}
                     step={0.01}
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
    if (spatialInputIsValid(e.target)) {
      selectedCoords[e.target.id] = Number(e.target.value);
      this.props.onCoordChange(selectedCoords);
    }
  }
}
