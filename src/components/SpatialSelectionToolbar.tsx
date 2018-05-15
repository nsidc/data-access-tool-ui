import * as React from "react";

import "./SpatialSelection.css";
import { SpatialSelectionType } from "./SpatialSelectionType";

interface SpatialSelectionToolbarProps {
    onResetClick: any;
    onSelectionStart: any;
}

export class SpatialSelectionToolbar extends React.Component<SpatialSelectionToolbarProps, {}> {
    constructor(props: any) {
      super(props);
      this.handlePolygonChange = this.handlePolygonChange.bind(this);
      this.handleSquareChange = this.handleSquareChange.bind(this);
      this.handleResetChange = this.handleResetChange.bind(this);
    }

    handlePolygonChange() {
      this.props.onSelectionStart("polygon");
    }

    handleSquareChange() {
      this.props.onSelectionStart("square");
    }

    handleResetChange() {
      this.props.onResetClick();
    }

    render() {
      return (
        <div id="toolbar">
          <SpatialSelectionType name="polygon" onClick={this.handlePolygonChange} />
          <SpatialSelectionType name="square" onClick={this.handleSquareChange} />
          <SpatialSelectionType name="reset" onClick={this.handleResetChange} />
        </div>
      );
    }
}
