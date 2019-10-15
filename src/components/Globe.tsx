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
  onBoundingBoxChange: (s: number[]) => void;
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
    this.cesiumAdapter = new CesiumAdapter(this.updateBoundingBox, this.updateSpatialSelection,
      this.enableLonLat, this.updateLonLat);
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
        this.cesiumAdapter.displayBoundingBox(this.props.collectionSpatialCoverage,
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
      this.cesiumAdapter.displayBoundingBox(this.props.collectionSpatialCoverage, this.props.boundingBox,
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
            onClickBoundingBox={() => {
              this.cesiumAdapter.clearSpatialSelection();
              setTimeout(() => { this.cesiumAdapter.clearBoundingBox(); }, 0);
              window.setTimeout(this.startBoundingBox, 0);
            }}
            onClickHome={() => {
              this.cesiumAdapter.flyHome();
            }}
            onClickPolygon={() => {
              this.cesiumAdapter.clearSpatialSelection();
              setTimeout(() => { this.cesiumAdapter.clearBoundingBox(); }, 0);
              window.setTimeout(this.startSpatialSelection, 0);
            }}
            onClickReset={() => {
              this.cesiumAdapter.clearSpatialSelection();
              setTimeout(() => { this.cesiumAdapter.clearBoundingBox(); }, 0);
            }} />
          <div id="credit" />
        </div>
      </div>
    );
  }

  private startBoundingBox = () => {
    this.cesiumAdapter.startBoundingBox();
    CesiumUtils.setCursorCrosshair();
  }

  private updateBoundingBox = (boundingBox: number[]) => {
    if (this.props.collectionSpatialCoverage) {
      const bbox = this.props.collectionSpatialCoverage.bbox;
      boundingBox[0] = Math.max(bbox[0], boundingBox[0]);
      boundingBox[1] = Math.max(bbox[1], boundingBox[1]);
      boundingBox[2] = Math.min(bbox[2], boundingBox[2]);
      boundingBox[3] = Math.min(bbox[3], boundingBox[3]);
    }
    if (!boundingBoxMatch(boundingBox, this.props.boundingBox)) {
      this.props.onBoundingBoxChange(boundingBox);
    }
    CesiumUtils.unsetCursorCrosshair();
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
