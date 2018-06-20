import * as React from "react";

import { CesiumAdapter } from "../utils/CesiumAdapter";
import { SpatialSelectionToolbar } from "./SpatialSelectionToolbar";

import "../css/index.css";
import { IGeoJsonPolygon } from "../types/GeoJson";

interface IGlobeProps {
  spatialSelection: IGeoJsonPolygon;
  resetSpatialSelection: () => void;

  // function defined in EverestUI, passed down to update state up there
  updateSpatialSelection: (s: IGeoJsonPolygon) => void;
}

interface IGlobeState {
  spatialSelection: IGeoJsonPolygon;
}

export class Globe extends React.Component<IGlobeProps, IGlobeState> {
  private cesiumAdapter: CesiumAdapter;
  private elementId = "globe";
  private spatialSelection: IGeoJsonPolygon;

  public constructor(props: IGlobeProps) {
    super(props);
    this.cesiumAdapter = new CesiumAdapter(this.updateSpatialSelection);
    this.spatialSelection = props.spatialSelection;
  }

  public componentDidMount() {
    this.cesiumAdapter.createViewer(this.elementId, this.props.spatialSelection);
  }

  public shouldComponentUpdate(nextProps: any, nextState: any) {
    return this.spatialSelection !== nextProps.spatialSelection;
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
    this.spatialSelection = spatialSelection;
    this.props.updateSpatialSelection(spatialSelection);
    this.unsetCursorCrosshair();
  }
}
