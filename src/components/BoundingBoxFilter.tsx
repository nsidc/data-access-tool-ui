import { faUndoAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";

import { hasChanged } from "../utils/hasChanged";

interface IBoundingBoxFilterProps {
  onClick: any;
  boundingBox: number[];
  updateBoundingBox: any;
}

interface IBoundingBoxFilterState {
  boundingBox: number[];
}

export class BoundingBoxFilter extends React.Component<IBoundingBoxFilterProps, IBoundingBoxFilterState> {
  public constructor(props: IBoundingBoxFilterProps) {
    super(props);

    this.state = {
      boundingBox: [-180, -90, 180, 90],
    };
  }

  public shouldComponentUpdate(nextProps: IBoundingBoxFilterProps, nextState: IBoundingBoxFilterState) {
    const propsChanged = hasChanged(this.props, nextProps, ["boundingBox"]);
    if (propsChanged) {
      this.setState({ boundingBox: [...nextProps.boundingBox] });
    }
    const stateChanged = hasChanged(this.state, nextState, ["boundingBox"]);
    return propsChanged || stateChanged;
  }

  public render() {
    return (
      <div id="temporal-selection">
        <h3>Filter by bounding box:</h3>
        <label className="from">Left</label>
        <input type="text"
          value={this.state.boundingBox[0]}
          onChange={this.leftLongitudeChange}
          onKeyPress={this.leftLongitudeEnter}>
        </input>
        <div onClick={this.props.onClick}>
          <button className="buttonReset" data-tip="Reset bounding box to default">
            <FontAwesomeIcon icon={faUndoAlt} size="lg" />
          </button>
        </div>
      </div>
    );
  }

  private leftLongitudeChange = (e: any) => {
    if (RegExp("^[+-]?[0-9]*\.?[0-9]*").test(e.target.value)) {
      const boundingBox = [...this.state.boundingBox];
      boundingBox[0] = e.target.value;
      this.setState({ boundingBox });
    }
  }

  private leftLongitudeEnter = (e: any) => {
    if (e.key === "Enter") {
      if (e.target.value === this.props.boundingBox[0]) { return; }
      const boundingBox = [...this.state.boundingBox];
      boundingBox[0] = e.target.value;
      this.props.updateBoundingBox(boundingBox);
    } else if (RegExp("^[+-]?[0-9]*\.?[0-9]*").test(e.target.value)) {
      const boundingBox = [...this.state.boundingBox];
      boundingBox[0] = e.target.value;
      this.setState({ boundingBox });
    } else {
      e.preventDefault();
    }
  }
}
