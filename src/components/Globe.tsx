import * as React from "react";

import "../styles/index.less";
import { IGeoJsonPolygon } from "../types/GeoJson";
import { CesiumAdapter } from "../utils/CesiumAdapter";
import { CesiumUtils } from "../utils/CesiumUtils";
import { hasChanged } from "../utils/hasChanged";
import { HelpText } from "./HelpText";
import { LonLatInput } from "./LonLatInput";
import { SpatialSelectionToolbar } from "./SpatialSelectionToolbar";

interface IGlobeProps {
  collectionSpatialCoverage: IGeoJsonPolygon | null;
  spatialSelection: IGeoJsonPolygon | null;
  onSpatialSelectionChange: (s: IGeoJsonPolygon | null) => void;
}

interface IGlobeState {
  lonLatEnable: boolean;
  lonLatLabel: string;
}

export class Globe extends React.Component<IGlobeProps, IGlobeState> {
  private cesiumAdapter: CesiumAdapter;

  public constructor(props: IGlobeProps) {
    super(props);
    this.state = {
      lonLatEnable: false,
      lonLatLabel: "",
    };
    this.cesiumAdapter = new CesiumAdapter(this.updateSpatialSelection, this.enableLonLat, this.updateLonLat);
  }

  public componentDidMount() {
    this.cesiumAdapter.createViewer();

    if (this.props.collectionSpatialCoverage !== null) {
      this.cesiumAdapter.renderCollectionCoverage(this.props.collectionSpatialCoverage.bbox);
    }

    if (this.props.spatialSelection !== null) {
      this.cesiumAdapter.renderSpatialSelection(this.props.spatialSelection);
      this.cesiumAdapter.flyToSpatialSelection(this.props.spatialSelection);
    }
  }

  public shouldComponentUpdate(nextProps: IGlobeProps, nextState: IGlobeState) {
    const propsChanged = hasChanged(this.props, nextProps, ["spatialSelection", "collectionSpatialCoverage"]);
    const stateChanged = hasChanged(this.state, nextState, ["lonLatEnable", "lonLatLabel"]);
    return propsChanged || stateChanged;
  }

  public componentDidUpdate(prevProps: IGlobeProps) {
    if (hasChanged(prevProps, this.props, ["collectionSpatialCoverage"])) {
      if (this.props.collectionSpatialCoverage !== null) {
        this.cesiumAdapter.renderCollectionCoverage(this.props.collectionSpatialCoverage.bbox);
      }
    }
  }

  public render() {
    return (
      <div id="spatial-selection">
        <HelpText />
        <div id={CesiumUtils.viewerId}>
          <LonLatInput
            lonLatEnable={this.state.lonLatEnable}
            lonLatLabel={this.state.lonLatLabel}
            polygonMode={this.cesiumAdapter.polygonMode}
            updateLonLat={this.updateLonLat}
          />
          <SpatialSelectionToolbar
            onClickHome={() => {
              this.cesiumAdapter.flyHome();
            }}
            onClickPolygon={() => {
              this.cesiumAdapter.clearSpatialSelection();
              this.cesiumAdapter.startSpatialSelection();
              CesiumUtils.setCursorCrosshair();
            }}
            onClickReset={() => {
              this.cesiumAdapter.clearSpatialSelection();
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

  private updateLonLat = (lonLatLabel: string) => {
    this.setState({ lonLatLabel });
  }

  private enableLonLat = (lonLatEnable: boolean) => {
    this.setState({ lonLatEnable });
  }

}
