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
    this.cesiumAdapter.createViewer(this.props.spatialSelection);
  }

  public shouldComponentUpdate(nextProps: IGlobeProps, nextState: IGlobeState) {
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
          <div>
            <input id="lonLat" type="text" disabled={!this.state.lonLatEnable}
              value={this.state.lonLatLabel} onChange={this.handleLonLat} onKeyDown={this.lonLatOnKeydown}>
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

  private updateLonLat = (lonLatLabel: string) => {
    this.setState({ lonLatLabel });
    this.forceUpdate();
  }

  private enableLonLat = (lonLatEnable: boolean) => {
    this.setState({ lonLatEnable });
    this.forceUpdate();
  }

  private handleLonLat = (e: any) => {
    this.setState({ lonLatLabel: e.target.value });
    this.forceUpdate();
  }

  private lonLatOnKeydown = (e: any) => {
    switch (e.key) {
      case "Enter":
        this.cesiumAdapter.polygonMode.changeLonLat(e.target.value);
        this.forceUpdate();
        break;
      case "Escape":
        this.cesiumAdapter.polygonMode.resetLonLat();
        this.forceUpdate();
        break;
      case "Tab":
        this.cesiumAdapter.polygonMode.changeLonLat(e.target.value);
        if (e.shiftKey) {
          this.cesiumAdapter.polygonMode.previousPoint();
        } else {
          this.cesiumAdapter.polygonMode.nextPoint();
        }
        this.forceUpdate();
        e.preventDefault();
        break;
      default:
        break;
    }
  }

}
