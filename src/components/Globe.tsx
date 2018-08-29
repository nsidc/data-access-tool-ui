import * as React from "react";
import "../styles/index.less";
import { IGeoJsonPolygon } from "../types/GeoJson";
import { CesiumAdapter } from "../utils/CesiumAdapter";
import { CesiumUtils } from "../utils/CesiumUtils";
import { hasChanged } from "../utils/hasChanged";
import { HelpText } from "./HelpText";
import { SpatialSelectionToolbar } from "./SpatialSelectionToolbar";

interface IGlobeProps {
  spatialSelection: IGeoJsonPolygon;
  resetSpatialSelection: () => void;
  onSpatialSelectionChange: (s: IGeoJsonPolygon) => void;
}

export class Globe extends React.Component<IGlobeProps, {}> {
  private cesiumAdapter: CesiumAdapter;

  public constructor(props: IGlobeProps) {
    super(props);
    this.cesiumAdapter = new CesiumAdapter(this.updateSpatialSelection);
  }

  public componentDidMount() {
    this.cesiumAdapter.createViewer(this.props.spatialSelection);
  }

  public shouldComponentUpdate(nextProps: IGlobeProps) {
    return hasChanged(this.props, nextProps, ["spatialSelection"]);
  }

  public componentDidUpdate() {
    this.cesiumAdapter.renderInitialBoundingBox(this.props.spatialSelection);
  }

  public render() {
    return (
      <div id="spatial-selection">
        <HelpText />
        <div id={CesiumUtils.viewerId}>
          <SpatialSelectionToolbar
            onClickPolygon={() => {
              this.cesiumAdapter.clearSpatialSelection();
              this.cesiumAdapter.polygonMode.start();
              CesiumUtils.setCursorCrosshair();
            }}
            onClickReset={() => {
              this.cesiumAdapter.polygonMode.reset();
              this.cesiumAdapter.clearSpatialSelection();
              this.props.resetSpatialSelection();
            }} />
          <div id="credit" />
        </div>
      </div>
    );
  }

  private updateSpatialSelection = (spatialSelection: IGeoJsonPolygon) => {
    this.props.onSpatialSelectionChange(spatialSelection);
    CesiumUtils.unsetCursorCrosshair();
  }
}
