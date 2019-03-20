import * as React from "react";

import { faHome } from "@fortawesome/free-solid-svg-icons";
import { faDrawPolygon } from "@fortawesome/free-solid-svg-icons";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";

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
                              img={faHome}
                              title="Recenter globe/coverage"/>
        <SpatialSelectionType name="polygon"
                              onClick={() => this.props.onClickPolygon()}
                              img={faDrawPolygon}
                              title="Draw a polygon"/>
        <SpatialSelectionType name="reset"
                              onClick={() => this.props.onClickReset()}
                              img={faTrashAlt}
                              title="Delete polygon and remove filter"/>
      </div>
    );
  }
}
