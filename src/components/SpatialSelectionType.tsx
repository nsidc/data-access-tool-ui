import * as React from "react";

import * as reset from "./img/glyphicons_067_cleaning.png";
import * as square from "./img/glyphicons_094_vector_path_square.png";
import "./SpatialSelection.css";

interface ISpatialSelectionTypeProps {
  name: string;
  onClick: any;
}

export class SpatialSelectionType extends React.Component <ISpatialSelectionTypeProps, {}> {
  public constructor(props: ISpatialSelectionTypeProps) {
    super(props);
  }

  public render() {
    // This feels a bit clunky...
    let img = reset;
    let alt = "Reset bounding box";
    if (this.props.name === "extent") {
      img = square;
      alt = "Click to draw a bounding box";
    }

    return (
      <div className="button" onClick={(e: any) => this.props.onClick(e.target.value)}>
        <img className={this.props.name} src={img} alt={alt}/>
      </div>
    );
  }
}
