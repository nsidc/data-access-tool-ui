import * as React from "react";

import { faSquare } from "@fortawesome/free-regular-svg-icons";
import { faDrawPolygon, faHome, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

import "../styles/index.less";
import { SpatialSelectionType } from "./SpatialSelectionType";

interface ISpatialSelectionToolbarProps {
  onClickBoundingBox: () => void;
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
                              img={faHome}
                              title="Re-center globe/coverage"/>
        <SpatialSelectionType name="boundingBox"
                              onClick={() => this.props.onClickBoundingBox()}
                              img={faSquare}
                              title="Draw a bounding box" />
        <SpatialSelectionType name="polygon"
                              onClick={() => this.props.onClickPolygon()}
                              img={faDrawPolygon}
                              title="Draw a polygon spatial filter"/>
        <SpatialSelectionType name="reset"
                              onClick={() => this.props.onClickReset()}
                              img={faTrashAlt}
                              title="Delete spatial filters"/>
      </div>
    );
  }
}
