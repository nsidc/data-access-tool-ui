import * as React from "react";

import "./SpatialSelection.css";
import { SpatialSelectionType } from "./SpatialSelectionType";

interface SpatialSelectionToolbarProps {
    onShapeClick: any;
}

export class SpatialSelectionToolbar extends React.Component<SpatialSelectionToolbarProps, {}> {
    constructor(props: any) {
      super(props);
      this.handlePolygonChange = this.handlePolygonChange.bind(this);
      this.handleSquareChange = this.handleSquareChange.bind(this);
      this.handleResetChange = this.handleResetChange.bind(this);
    }

    handlePolygonChange() {
      console.log("clicked polygon");
      this.props.onShapeClick("polygon")
    }

    handleSquareChange() {
      console.log("clicked square");
      this.props.onShapeClick("square")
    }

    handleResetChange() {
      console.log("clicked reset");
      this.props.onShapeClick("reset")
    }

    render() {
      return (
        <div id="toolbar" className="toolbar">
          <SpatialSelectionType name="polygon" onClick={this.handlePolygonChange} />
          <SpatialSelectionType name="square" onClick={this.handleSquareChange} />
          <SpatialSelectionType name="reset" onClick={this.handleResetChange} />
        </div>
      );
    }
}
