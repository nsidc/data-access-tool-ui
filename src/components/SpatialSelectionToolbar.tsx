import * as React from "react";

import { faSquare } from "@fortawesome/free-regular-svg-icons";
import { faDrawPolygon, faFolderOpen, faHome, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

import "../styles/index.less";
import { SpatialSelectionType } from "./SpatialSelectionType";

interface ISpatialSelectionToolbarProps {
  onClickBoundingBox: () => void;
  onClickHome: () => void;
  onClickImportShape: (e: any) => void;
  onClickPolygon: () => void;
  onClickReset: () => void;
}

export class SpatialSelectionToolbar extends React.Component<ISpatialSelectionToolbarProps, {}> {
  public render() {
    // For the <input file>, the onClick is necessary to allow the same file to be chosen again
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
        <input type="file" id="importShapeInput"
               onClick={(e: any) => e.target.value = null}
               onChange={(e) => this.props.onClickImportShape(e.target.files)} />
        <SpatialSelectionType name="import"
                              onClick={() => {
                                const chooseFile = document.getElementById("importShapeInput");
                                if (chooseFile) {
                                  chooseFile.click();
                                }
                              }}
                              img={faFolderOpen}
                              title="Import polygon" />
        <SpatialSelectionType name="reset"
                              onClick={() => this.props.onClickReset()}
                              img={faTrashAlt}
                              title="Delete spatial filters"/>
      </div>
    );
  }
}
