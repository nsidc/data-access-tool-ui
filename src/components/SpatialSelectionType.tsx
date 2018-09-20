import * as React from "react";

import "../styles/index.less";
import { hasChanged } from "../utils/hasChanged";

interface ISpatialSelectionTypeProps {
  title: string;
  img: any;
  name: string;
  onClick: any;
}

export class SpatialSelectionType extends React.Component <ISpatialSelectionTypeProps, {}> {
  public constructor(props: ISpatialSelectionTypeProps) {
    super(props);
  }

  public shouldComponentUpdate(nextProps: ISpatialSelectionTypeProps) {
    return hasChanged(this.props, nextProps, ["title", "img", "name"]);
  }

  public render() {
    return (
      <div className="cesium-button cesium-toolbar-button" onClick={(e: any) => this.props.onClick(e.target.value)}>
        <img src={this.props.img} alt={this.props.title} title={this.props.title}/>
      </div>
    );
  }
}
