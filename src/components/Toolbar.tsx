import * as React from "react";

import "./Toolbar.css";
import { DrawingTool } from "./DrawingTool";

export class Toolbar extends React.Component {
    constructor(props: any) {
      super(props);
      this.handlePolygonChange = this.handlePolygonChange.bind(this);
      this.handleSquareChange = this.handleSquareChange.bind(this);
      this.handleResetChange = this.handleResetChange.bind(this);
      this.state = {
        polygonClicked: false,
        squareClicked: false,
        resetClicked: false
      };
    }

    handlePolygonChange() {
      console.log("clicked polygon");
    }

    handleSquareChange() {
      console.log("clicked square");
    }

    handleResetChange() {
      console.log("clicked reset");
    }

    render() {
      return (
        <div id="toolbar" className="toolbar">
          <DrawingTool toolName="polygon" onClick={this.handlePolygonChange}/>
          <DrawingTool toolName="square" onClick={this.handleSquareChange}/>
          <DrawingTool toolName="reset" onClick={this.handleResetChange}/>
        </div>
      );
    }
}
