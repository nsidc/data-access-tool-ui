import * as React from "react";

import "../css/index.css";
import * as callout from "../img/callout.png";

interface ISpatialSelectionTypeProps {
  alt: string;
  img: any;
  name: string;
  onClick: any;
}

export class SpatialSelectionType extends React.Component <ISpatialSelectionTypeProps, {}> {
  public constructor(props: ISpatialSelectionTypeProps) {
    super(props);
  }

  public render() {
    return (
      <div className="tooltip button" onClick={(e: any) => this.props.onClick(e.target.value)}>
        <img className="img-no-border-left {this.props.name}" src={this.props.img} alt={this.props.alt}/>
        <span>
          <img className="img-no-border-left callout" src={callout} />
          {this.props.alt}
        </span>
      </div>
    );
  }
}
