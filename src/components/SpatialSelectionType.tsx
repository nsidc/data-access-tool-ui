import * as React from "react";

import "../css/SpatialSelection.css";

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
      <div className="button" onClick={(e: any) => this.props.onClick(e.target.value)}>
        <img className={this.props.name} src={this.props.img} alt={this.props.alt}/>
      </div>
    );
  }
}
