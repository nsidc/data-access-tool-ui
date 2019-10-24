import { faUndoAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";

import { BoundingBox } from "../types/BoundingBox";
import { boundingBoxMatch } from "../utils/CMR";
import { hasChanged } from "../utils/hasChanged";

interface IBoundingBoxFilterProps {
  onClick: any;
  boundingBox: BoundingBox;
  hasPolygon: boolean;
  onBoundingBoxChange: any;
}

interface IBoundingBoxFilterState {
  boundingBox: BoundingBox;
}

export class BoundingBoxFilter extends React.Component<IBoundingBoxFilterProps, IBoundingBoxFilterState> {

  public constructor(props: IBoundingBoxFilterProps) {
    super(props);
    this.state = {
      boundingBox: this.props.boundingBox,
    };
  }

  public shouldComponentUpdate(nextProps: IBoundingBoxFilterProps, nextState: IBoundingBoxFilterState) {
    const propsChanged = hasChanged(this.props, nextProps, ["boundingBox", "hasPolygon"]);
    if (hasChanged(this.props, nextProps, ["boundingBox"])) {
      this.setState({ boundingBox: nextProps.boundingBox });
    }
    const stateChanged = hasChanged(this.state, nextState, ["boundingBox"]);
    return propsChanged || stateChanged;
  }

  public render() {
    return (
      <div id="boundingbox">
        <h3>Filter spatially by bounding box:</h3>&nbsp;
        {this.inputBoundingBox("W", "west", this.props.hasPolygon)}
        {this.inputBoundingBox("S", "south", this.props.hasPolygon)}
        {this.inputBoundingBox("E", "east", this.props.hasPolygon)}
        {this.inputBoundingBox("N", "north", this.props.hasPolygon)}
        <button className="buttonReset"
          onClick={this.props.onClick}
          data-tip="Reset bounding box to entire dataset"
          disabled={this.props.hasPolygon}>
          <FontAwesomeIcon icon={faUndoAlt} size="lg" />
        </button>
      </div>
    );
  }

  private inputBoundingBox = (label: string, index: string, disabled: boolean) => {
    const isDisabled = disabled ? "disabled" : "";
    return (
      <div>
        <label className={isDisabled}>{label}</label>
        <input type="text" className="bbox" disabled={disabled}
          value={this.state.boundingBox[index]}
          onBlur={(e: any) => this.boundingBoxOnBlur(e, index)}
          onChange={(e: any) => this.boundingBoxChange(e, index)}
          onKeyPress={(e: any) => this.boundingBoxEnter(e, index)}>
        </input>
      </div>
    );
  }

  private boundingBoxChange = (e: any, index: string) => {
    if (RegExp("^[+-]?[0-9]*\\.?[0-9]*$").test(e.target.value)) {
      const boundingBox = this.state.boundingBox.clone();
      boundingBox[index] = e.target.value;
      this.setState({ boundingBox });
    } else {
      // Didn't match the "number" pattern, set back to old value.
      this.forceUpdate();
    }
  }

  private boundingBoxEnter = (e: any, index: string) => {
    if (e.key === "Enter") {
      this.boundingBoxUpdate(e.target.value, index);
    }
  }

  private boundingBoxOnBlur = (e: any, index: string) => {
    this.boundingBoxUpdate(e.target.value, index);
  }

  private boundingBoxUpdate = (newvalue: string, index: string) => {
    if (newvalue.trim() === "") {
      newvalue = this.props.boundingBox[index].toString();
    }
    const boundingBox = this.state.boundingBox.clone();
    boundingBox[index] = parseFloat(newvalue);
    boundingBox.west = Math.min(Math.max(boundingBox.west, -180), 180);
    boundingBox.east = Math.min(Math.max(boundingBox.east, -180), 180);
    boundingBox.south = Math.min(Math.max(boundingBox.south, -90), 90);
    boundingBox.north = Math.min(Math.max(boundingBox.north, -90), 90);
    // TODO: Fix dateline
    if (boundingBox.west > boundingBox.east) {
      const tmp = boundingBox.west;
      boundingBox.west = boundingBox.east;
      boundingBox.east = tmp;
    }
    if (boundingBox.south > boundingBox.north) {
      const tmp = boundingBox.south;
      boundingBox.south = boundingBox.north;
      boundingBox.north = tmp;
    }
    this.setState({ boundingBox });
    if (!boundingBoxMatch(boundingBox, this.props.boundingBox)) {
      this.props.onBoundingBoxChange(boundingBox);
    }
  }
}
