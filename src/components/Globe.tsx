import * as React from "react";

import "../css/index.css";
import { IGeoJsonPolygon } from "../types/GeoJson";
import { CesiumAdapter } from "../utils/CesiumAdapter";
import { SpatialSelectionToolbar } from "./SpatialSelectionToolbar";

interface IGlobeProps {
  spatialSelection: IGeoJsonPolygon;
  resetSpatialSelection: () => void;
  onSpatialSelectionChange: (s: IGeoJsonPolygon) => void;
}

export class Globe extends React.Component<IGlobeProps, {}> {
  private cesiumAdapter: CesiumAdapter;
  private elementId = "globe";

  public constructor(props: IGlobeProps) {
    super(props);
    this.cesiumAdapter = new CesiumAdapter(this.updateSpatialSelection);
  }

  public componentDidMount() {
    this.cesiumAdapter.createViewer(this.elementId, this.props.spatialSelection);
  }

  public shouldComponentUpdate(nextProps: any, nextState: any) {
    return this.props.spatialSelection !== nextProps.spatialSelection;
  }

  public componentDidUpdate() {
    this.cesiumAdapter.renderInitialBoundingBox(this.props.spatialSelection);
  }

  public render() {
    return (
      <div id="spatial-selection">
        <div id={this.elementId}>
          <SpatialSelectionToolbar
            onClickPolygon={() => {
              this.cesiumAdapter.clearSpatialSelection();
              this.cesiumAdapter.startPolygonMode();
              this.setCursorCrosshair();
            }}
            onClickReset={() => {
              this.cesiumAdapter.clearSpatialSelection();
              this.props.resetSpatialSelection();
            }} />
          <div id="credit" />
        </div>
      </div>
    );
  }

  private setCursorCrosshair() {
    const el = document.getElementById(this.elementId);

    if (el && el.classList && el.classList.add) {
      el.classList.add("cursor-crosshair");
    }
  }

  private unsetCursorCrosshair() {
    const el = document.getElementById(this.elementId);

    if (el && el.classList && el.classList.remove) {
      el.classList.remove("cursor-crosshair");
    }
  }

  private updateSpatialSelection = (spatialSelection: IGeoJsonPolygon) => {
    this.props.onSpatialSelectionChange(spatialSelection);
    this.unsetCursorCrosshair();
  }
}
