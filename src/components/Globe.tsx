import * as React from "react";

import "../styles/index.less";
import { IGeoJsonPolygon } from "../types/GeoJson";
import { CesiumAdapter } from "../utils/CesiumAdapter";
import { CesiumUtils } from "../utils/CesiumUtils";
import { boundingBoxMatch } from "../utils/CMR";
import { hasChanged } from "../utils/hasChanged";
import { HelpText } from "./HelpText";
import { LonLatInput } from "./LonLatInput";
import { SpatialSelectionToolbar } from "./SpatialSelectionToolbar";

interface IGlobeProps {
  boundingBox: number[];
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

    let flyToRectangle = null;

    if (this.props.collectionSpatialCoverage !== null) {
      this.cesiumAdapter.renderCollectionCoverage(this.props.collectionSpatialCoverage.bbox);
      flyToRectangle = this.props.collectionSpatialCoverage.bbox;
    }

    if (this.props.spatialSelection !== null) {
      this.cesiumAdapter.renderSpatialSelection(this.props.spatialSelection);
      this.cesiumAdapter.flyToSpatialSelection(this.props.spatialSelection);
    } else {
      const collectionBoundingBox = this.props.collectionSpatialCoverage ?
        this.props.collectionSpatialCoverage.bbox : [-180, -90, 180, 90];
      if (!boundingBoxMatch(this.props.boundingBox, collectionBoundingBox)) {
        this.cesiumAdapter.renderBoundingBox(this.props.collectionSpatialCoverage,
          this.props.boundingBox, this.props.spatialSelection !== null);
        flyToRectangle = this.props.boundingBox;
      }
      if (flyToRectangle) {
        this.cesiumAdapter.flyToRectangle(flyToRectangle);
      }
    }
  }

  public shouldComponentUpdate(nextProps: IGlobeProps, nextState: IGlobeState) {
    const propsChanged = hasChanged(this.props, nextProps, ["boundingBox",
      "spatialSelection", "collectionSpatialCoverage"]);
    const stateChanged = hasChanged(this.state, nextState, ["lonLatEnable", "lonLatLabel"]);
    return propsChanged || stateChanged;
  }

  public componentDidUpdate(prevProps: IGlobeProps) {
    if (hasChanged(prevProps, this.props, ["collectionSpatialCoverage"])) {
      if (this.props.collectionSpatialCoverage !== null) {
        this.cesiumAdapter.renderCollectionCoverage(this.props.collectionSpatialCoverage.bbox);
        this.cesiumAdapter.flyToRectangle(this.props.collectionSpatialCoverage.bbox);
      }
    }
    if (hasChanged(prevProps, this.props, ["boundingBox"])) {
      this.cesiumAdapter.renderBoundingBox(this.props.collectionSpatialCoverage, this.props.boundingBox,
        this.props.spatialSelection !== null);
      this.cesiumAdapter.flyToRectangle(this.props.boundingBox);
    }
    if (hasChanged(prevProps, this.props, ["spatialSelection"])) {
      if (this.props.spatialSelection === null) {
        this.cesiumAdapter.clearSpatialSelection();
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
              window.setTimeout(this.startSpatialSelection, 0);
            }}
            onClickReset={() => {
              this.cesiumAdapter.clearSpatialSelection();
            }} />
          <div id="credit" />
        </div>
      </div>
    );
  }

  private startSpatialSelection = () => {
    this.cesiumAdapter.startSpatialSelection();
    CesiumUtils.setCursorCrosshair();
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
