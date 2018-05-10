import * as React from "react";

import "./Toolbar.css";

let Cesium = require("cesium/Cesium");
let cesiumWidget = require("cesium/Widgets/widgets.css");
const polygon = require("./img/glyphicons_096_vector_path_polygon.png");
const square = require("./img/glyphicons_094_vector_path_square.png");
const reset = require("./img/glyphicons_067_cleaning.png");

interface DrawingToolProps {
  toolName: string;
  onClick: any;
}

export class DrawingTool extends React.Component <DrawingToolProps, {}> {
    displayName = "DrawingTool";

    constructor(props: any) {
        super(props);
        this.state = {isClicked: false};
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e: any) {
      this.props.onClick(e.target.value);
    }

    render() {
      // Need a better way of assigning image!
      let img;
      switch (this.props.toolName) {
        case "polygon":
          img = polygon;
          break;
        case "square":
          img = square;
          break;
        default:
          img = reset;
      }

      return (
        <div className="button" onClick={this.handleChange}><img src={img}/></div>
      );
    }
}
