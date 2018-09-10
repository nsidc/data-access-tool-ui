import * as React from "react";

import * as resetImg from "../img/glyphicons_067_cleaning.png";
import * as polygonImg from "../img/glyphicons_096_vector_path_polygon.png";

import "../styles/index.less";
import { SpatialSelectionType } from "./SpatialSelectionType";

interface ISpatialSelectionToolbarProps {
  onClickReset: () => void;
  onClickPolygon: () => void;
}

export class SpatialSelectionToolbar extends React.Component<ISpatialSelectionToolbarProps, {}> {
  public render() {
    return (
      <div id="toolbar">
        <SpatialSelectionType name="polygon"
                              onClick={() => this.props.onClickPolygon()}
                              img={polygonImg}
                              alt="Click to draw a polygon"/>
        <SpatialSelectionType name="reset"
                              onClick={() => this.props.onClickReset()}
                              img={resetImg}
                              alt="Click to reset polygon"/>
      </div>
    );
  }
}
