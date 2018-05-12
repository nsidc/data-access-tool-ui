import * as React from "react";

import "./Toolbar.css";

const polygon = require("./img/glyphicons_096_vector_path_polygon.png");
const square = require("./img/glyphicons_094_vector_path_square.png");
const reset = require("./img/glyphicons_067_cleaning.png");

interface SpatialSelectionTypeProps {
  name: string;
  onClick: any;
}

export class SpatialSelectionType extends React.Component <SpatialSelectionTypeProps, {}> {
    displayName = "SpatialSelectionType";

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
      switch (this.props.name) {
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
