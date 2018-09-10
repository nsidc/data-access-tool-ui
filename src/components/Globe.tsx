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
  latLon: string;
}

export class Globe extends React.Component<IGlobeProps, IGlobeState> {
  private cesiumAdapter: CesiumAdapter;

  public constructor(props: IGlobeProps) {
    super(props);
    this.state = {
      latLon: "",
    };
    this.cesiumAdapter = new CesiumAdapter(this.updateSpatialSelection);
  }

  public componentDidMount() {
    this.cesiumAdapter.createViewer(this.props.spatialSelection);
  }

  public shouldComponentUpdate(nextProps: IGlobeProps, nextState: IGlobeState) {
    const propsChanged = hasChanged(this.props, nextProps, ["spatialSelection"]);
    const stateChanged = hasChanged(this.state, nextState, ["latLon"]);
    return propsChanged || stateChanged;
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
            <input type="text" value="{this.state.latLon}" onChange={this.handleLatLon}></input>
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

  private handleLatLon = (e: any) => {
    const latLon = e.target.value;
    this.setState({ selectedCollection: e.target.value });
    this.props.onCollectionChange(collection);
  }

}
