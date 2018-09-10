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

interface IGlobeState {
  latLonEnable: boolean;
  latLonLabel: string;
}

export class Globe extends React.Component<IGlobeProps, IGlobeState> {
  private cesiumAdapter: CesiumAdapter;

  public constructor(props: IGlobeProps) {
    super(props);
    this.state = {
      latLonEnable: false,
      latLonLabel: "",
    };
    this.handleLatLon = this.handleLatLon.bind(this);
    this.cesiumAdapter = new CesiumAdapter(this.updateSpatialSelection, this.enableLatLon, this.updateLatLon);
  }

  public componentDidMount() {
    this.cesiumAdapter.createViewer(this.props.spatialSelection);
  }

  public shouldComponentUpdate(nextProps: IGlobeProps, nextState: IGlobeState) {
    const propsChanged = hasChanged(this.props, nextProps, ["spatialSelection"]);
//    const stateChanged = hasChanged(this.state, nextState, ["latLon"]);
    return propsChanged;
  }

  public componentDidUpdate() {
    this.cesiumAdapter.renderInitialBoundingBox(this.props.spatialSelection);
  }

  public render() {
    return (
      <div id="spatial-selection">
        <HelpText />
        <div id={CesiumUtils.viewerId}>
          <div>
            <input id="latLon" type="text" disabled={!this.state.latLonEnable}
              value={this.state.latLonLabel} onChange={this.handleLatLon} onKeyDown={this.latLonOnKeydown}>
              </input>
          </div>
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

  // Called by external code to update our label
  private updateLatLon = (latLonLabel: string) => {
    this.setState({ latLonLabel });
    this.forceUpdate();
  }

  // Called by external code to enable our label
  private enableLatLon = (latLonEnable: boolean) => {
    this.setState({ latLonEnable });
    this.forceUpdate();
  }

  private handleLatLon = (e: any) => {
//    this.cesiumAdapter.polygonMode.changeLatLon(e.target.value);
    this.setState({ latLonLabel: e.target.value });
    this.forceUpdate();
  }

  private latLonOnKeydown = (e: any) => {
    if (e.key === "Enter") {
      this.cesiumAdapter.polygonMode.changeLatLon(e.target.value);
      this.forceUpdate();
    }
  }

}
