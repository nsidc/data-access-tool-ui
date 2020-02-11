import * as React from "react";

import { faSquare } from "@fortawesome/free-regular-svg-icons";
import { faDrawPolygon, faFolderOpen, faHome, faSave, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

import "../styles/index.less";
import { hasChanged } from "../utils/hasChanged";
import { SpatialSelectionType } from "./SpatialSelectionType";

interface ISpatialSelectionToolbarProps {
  onClickBoundingBox: () => void;
  onClickExportPolygon: () => void;
  onClickHome: () => void;
  onClickImportPolygon: (e: any) => void;
  onClickPolygon: () => void;
  onClickReset: () => void;
  disableExport: boolean;
  disableReset: boolean;
}

export class SpatialSelectionToolbar extends React.Component<ISpatialSelectionToolbarProps, {}> {
  public shouldComponentUpdate(nextProps: ISpatialSelectionToolbarProps) {
    const propsChanged = hasChanged(this.props, nextProps, ["disableExport", "disableReset"]);
    return propsChanged;
  }

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
        <input type="file" id="importPolygonInput"
               onClick={(e: any) => e.target.value = null}
               onChange={(e) => this.props.onClickImportPolygon(e.target.files)} />
        <SpatialSelectionType name="import"
                              onClick={() => {
                                const chooseFile = document.getElementById("importPolygonInput");
                                if (chooseFile) {
                                  chooseFile.click();
                                }
                              }}
                              img={faFolderOpen}
                              title="Import polygon" />
        <SpatialSelectionType name="export"
                              onClick={() => this.props.onClickExportPolygon()}
                              img={faSave}
                              disabled={this.props.disableExport}
                              title="Export polygon" />
        <SpatialSelectionType name="reset"
                              onClick={() => this.props.onClickReset()}
                              img={faTrashAlt}
                              disabled={this.props.disableReset}
                              title="Delete spatial filters"/>
      </div>
    );
  }
}
