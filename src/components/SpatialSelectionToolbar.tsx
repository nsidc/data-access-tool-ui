import * as React from "react";

import * as resetImg from "../img/cleaning.png";
import * as homeImg from "../img/home.png";
import * as polygonImg from "../img/polygon.png";

import "../styles/index.less";
import { SpatialSelectionType } from "./SpatialSelectionType";

interface ISpatialSelectionToolbarProps {
  onClickHome: () => void;
  onClickPolygon: () => void;
  onClickReset: () => void;
}

export class SpatialSelectionToolbar extends React.Component<ISpatialSelectionToolbarProps, {}> {
  public render() {
    return (
      <div id="toolbar">
        <SpatialSelectionType name="home"
                              onClick={() => this.props.onClickHome()}
                              img={homeImg}
                              title="Click to recenter globe"/>
        <SpatialSelectionType name="polygon"
                              onClick={() => this.props.onClickPolygon()}
                              img={polygonImg}
                              title="Click to draw a polygon"/>
        <SpatialSelectionType name="reset"
                              onClick={() => this.props.onClickReset()}
                              img={resetImg}
                              title="Click to reset polygon"/>
      </div>
    );
  }
}
