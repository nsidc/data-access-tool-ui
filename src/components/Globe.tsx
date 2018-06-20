import * as React from "react";

import { ISpatialSelection } from "../types/SpatialSelection";

import { CesiumAdapter } from "../utils/CesiumAdapter";
import { SpatialSelectionToolbar } from "./SpatialSelectionToolbar";

interface IGlobeProps {
  spatialSelection: ISpatialSelection;
  resetSpatialSelection: () => void;
  onSpatialSelectionChange: (s: any) => void;
}

interface IGlobeState {
  spatialSelection: any;
}

export class Globe extends React.Component<IGlobeProps, IGlobeState> {
  private cesiumAdapter: CesiumAdapter;
  private spatialSelection: any;

  public constructor(props: IGlobeProps) {
    super(props);
    this.cesiumAdapter = new CesiumAdapter(this.updateSpatialSelection.bind(this));
    this.spatialSelection = props.spatialSelection;
  }

  public componentDidMount() {
    this.cesiumAdapter.createViewer("globe", this.props.spatialSelection);
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
        <div id="globe">
          <SpatialSelectionToolbar
            onClickPolygon={() => {
              this.cesiumAdapter.clearSpatialSelection();
              this.cesiumAdapter.startPolygonMode();
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

  private updateSpatialSelection(spatialSelection: any) {
    this.spatialSelection = spatialSelection;
    this.props.onSpatialSelectionChange(spatialSelection);
  }
}
