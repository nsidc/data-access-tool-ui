import { faUndoAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";

import { hasChanged } from "../utils/hasChanged";

interface IBoundingBoxFilterProps {
  onClick: any;
  boundingBox: number[];
  hasPolygon: boolean;
  updateBoundingBox: any;
}

interface IBoundingBoxFilterState {
  boundingBox: number[];
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
      this.setState({ boundingBox: [...nextProps.boundingBox] });
    }
    const stateChanged = hasChanged(this.state, nextState, ["boundingBox"]);
    return propsChanged || stateChanged;
  }

  public render() {
    return (
      <div id="boundingbox">
        <h3>Filter by bounding box:</h3>
        {this.inputBoundingBox("Left", 0, this.props.hasPolygon)}
        {this.inputBoundingBox("Bottom", 1, this.props.hasPolygon)}
        {this.inputBoundingBox("Right", 2, this.props.hasPolygon)}
        {this.inputBoundingBox("Top", 3, this.props.hasPolygon)}
        <div onClick={this.props.onClick}>
          <button className="buttonReset" data-tip="Reset bounding box to default">
            <FontAwesomeIcon icon={faUndoAlt} size="lg" />
          </button>
        </div>
      </div>
    );
  }

  private inputBoundingBox = (label: string, index: number, disabled: boolean) => {
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

  private boundingBoxChange = (e: any, index: number) => {
    if (RegExp("^[+-]?[0-9]*\\.?[0-9]*$").test(e.target.value)) {
      const boundingBox = [...this.state.boundingBox];
      boundingBox[index] = e.target.value;
      this.setState({ boundingBox });
    } else {
      // Didn't match the "number" pattern, set back to old value.
      this.forceUpdate();
    }
  }

  private boundingBoxEnter = (e: any, index: number) => {
    if (e.key === "Enter") {
      this.boundingBoxUpdate(e.target.value, index);
    }
  }

  private boundingBoxOnBlur = (e: any, index: number) => {
    this.boundingBoxUpdate(e.target.value, index);
  }

  private boundingBoxUpdate = (newvalue: string, index: number) => {
    if (newvalue.trim() === "") {
      newvalue = this.props.boundingBox[index].toString();
    }
    const boundingBox = [...this.state.boundingBox];
    boundingBox[index] = parseFloat(newvalue);
    boundingBox[0] = Math.min(Math.max(boundingBox[0], -180), 180);
    boundingBox[2] = Math.min(Math.max(boundingBox[2], -180), 180);
    boundingBox[1] = Math.min(Math.max(boundingBox[1], -90), 90);
    boundingBox[3] = Math.min(Math.max(boundingBox[3], -90), 90);
    if (boundingBox[0] > boundingBox[2]) {
      [boundingBox[0], boundingBox[2]] = [boundingBox[2], boundingBox[0]];
    }
    if (boundingBox[1] > boundingBox[3]) {
      [boundingBox[1], boundingBox[3]] = [boundingBox[3], boundingBox[1]];
    }
    this.setState({ boundingBox });
    if (JSON.stringify(boundingBox) !== JSON.stringify(this.props.boundingBox)) {
      this.props.updateBoundingBox(boundingBox);
    }
  }
}
