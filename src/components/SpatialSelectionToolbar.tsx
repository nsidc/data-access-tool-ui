import * as React from "react";

import "./SpatialSelection.css";
import { SpatialSelectionType } from "./SpatialSelectionType";

interface ISpatialSelectionToolbarProps {
    onResetClick: any;
    onSelectionStart: any;
}

export class SpatialSelectionToolbar extends React.Component<ISpatialSelectionToolbarProps, {}> {
    public constructor(props: any) {
      super(props);
      this.handlePolygonChange = this.handlePolygonChange.bind(this);
      this.handleSquareChange = this.handleSquareChange.bind(this);
      this.handleResetChange = this.handleResetChange.bind(this);
    }

    public render() {
      return (
        <div id="toolbar">
          <SpatialSelectionType name="polygon" onClick={this.handlePolygonChange} />
          <SpatialSelectionType name="square" onClick={this.handleSquareChange} />
          <SpatialSelectionType name="reset" onClick={this.handleResetChange} />
        </div>
      );
    }

    private handlePolygonChange() {
      this.props.onSelectionStart("polygon");
    }

    private handleSquareChange() {
      this.props.onSelectionStart("square");
    }

    private handleResetChange() {
      this.props.onResetClick();
    }
}
