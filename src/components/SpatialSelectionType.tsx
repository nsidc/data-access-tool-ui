import * as React from "react";

import * as reset from "./img/glyphicons_067_cleaning.png";
import * as square from "./img/glyphicons_094_vector_path_square.png";
import * as polygon from "./img/glyphicons_096_vector_path_polygon.png";
import "./SpatialSelection.css";

interface ISpatialSelectionTypeProps {
  name: string;
  onClick: any;
}

export class SpatialSelectionType extends React.Component <ISpatialSelectionTypeProps, {}> {
  public constructor(props: any) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  public render() {
    // This feels a bit clunky...
    let img;
    let alt;
    switch (this.props.name) {
        case "polygon":
          img = polygon;
          alt = "Click to start drawing a 2D polygon";
          break;
        case "square":
          img = square;
          alt = "Click to draw a bounding box";
          break;
        default:
          img = reset;
    }

    return (
      <div className="button" onClick={this.handleChange}>
        <img className={this.props.name} src={img} alt={alt}/>
      </div>
    );
  }

  private handleChange(e: any) {
    this.props.onClick(e.target.value);
  }
}
