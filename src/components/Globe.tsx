import * as React from "react";

import { ISpatialSelection } from "../SpatialSelection";

import { CesiumAdapter } from "./CesiumAdapter";
import { SpatialSelectionToolbar } from "./SpatialSelectionToolbar";

interface IGlobeProps {
  spatialSelection: ISpatialSelection;
  onSpatialSelectionChange: (s: ISpatialSelection) => void;
}

export class Globe extends React.Component<IGlobeProps, {}> {
  private cesiumAdapter: CesiumAdapter;

  public constructor(props: IGlobeProps) {
    super(props);
    this.cesiumAdapter = new CesiumAdapter((s: ISpatialSelection) => this.props.onSpatialSelectionChange(s));
  }

  public componentDidMount() {
    this.cesiumAdapter.createViewer("globe", this.props.spatialSelection);
  }

  public render() {
    return (
      <div id="spatial-selection">
        <div id="globe"></div>
        <SpatialSelectionToolbar
          onSelectionStart={() => this.cesiumAdapter.handleSelectionStart()}
          onResetClick={() => this.cesiumAdapter.handleReset()} />
      </div>
    );
  }
}
