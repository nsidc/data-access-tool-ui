import * as React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
      <div className="cesium-button cesium-toolbar-button"
        onClick={(e: any) => this.props.onClick(e.target.value)}>
        <button className="toolbarButton" data-tip={this.props.title}>
          <FontAwesomeIcon icon={this.props.img} />
        </button>
      </div>
    );
  }
}
