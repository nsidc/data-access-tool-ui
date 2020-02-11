import * as React from "react";

import "../styles/index.less";
import { BoundingBox } from "../types/BoundingBox";
import { IGeoJsonPolygon } from "../types/GeoJson";
import { CesiumAdapter } from "../utils/CesiumAdapter";
import { CesiumUtils } from "../utils/CesiumUtils";
import { boundingBoxMatch } from "../utils/CMR";
import { hasChanged } from "../utils/hasChanged";
import { HelpText } from "./HelpText";
import { LonLatInput } from "./LonLatInput";
import { SpatialSelectionToolbar } from "./SpatialSelectionToolbar";

interface IGlobeProps {
  boundingBox: BoundingBox;
  onBoundingBoxChange: (s: BoundingBox) => void;
  collectionSpatialCoverage: BoundingBox | null;
  spatialSelection: IGeoJsonPolygon | null;
  onSpatialSelectionChange: (s: IGeoJsonPolygon | null) => void;
  setErrorMessage: (msg: string) => void;
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
      this.enableLonLat, this.updateLonLat, this.props.setErrorMessage);
  }

  public componentDidMount() {
    this.cesiumAdapter.createViewer();

    let flyToRectangle = null;

    if (this.props.collectionSpatialCoverage !== null) {
      this.cesiumAdapter.renderCollectionCoverage(this.props.collectionSpatialCoverage);
      flyToRectangle = this.props.collectionSpatialCoverage;
    }

    if (this.props.spatialSelection !== null) {
      this.cesiumAdapter.renderSpatialSelection(this.props.spatialSelection);
      this.cesiumAdapter.setFlyToSpatialSelection(this.props.spatialSelection);
      this.cesiumAdapter.flyHome();
    } else {
      const collectionBoundingBox = this.props.collectionSpatialCoverage ?
        this.props.collectionSpatialCoverage : BoundingBox.global();
      if (!boundingBoxMatch(this.props.boundingBox, collectionBoundingBox)) {
        this.cesiumAdapter.displayBoundingBox(this.props.collectionSpatialCoverage,
          this.props.boundingBox, this.props.spatialSelection !== null);
        flyToRectangle = this.props.boundingBox;
      }
      if (flyToRectangle) {
        this.cesiumAdapter.setFlyToRect(flyToRectangle);
        this.cesiumAdapter.flyHome();
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
        this.cesiumAdapter.renderCollectionCoverage(this.props.collectionSpatialCoverage);
        this.cesiumAdapter.setFlyToRect(this.props.collectionSpatialCoverage);
        this.cesiumAdapter.flyHome();
      }
    }
    if (!boundingBoxMatch(prevProps.boundingBox, this.props.boundingBox)) {
      this.cesiumAdapter.displayBoundingBox(this.props.collectionSpatialCoverage, this.props.boundingBox,
        this.props.spatialSelection !== null);
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
              window.setTimeout(() => { this.cesiumAdapter.clearBoundingBox(); }, 0);
              window.setTimeout(() => { this.cesiumAdapter.startBoundingBox(); }, 0);
            }}
            onClickHome={() => {
              this.cesiumAdapter.flyHome();
            }}
            onClickPolygon={() => {
              this.cesiumAdapter.clearBoundingBox();
              window.setTimeout(this.cesiumAdapter.clearSpatialSelection, 0);
              window.setTimeout(this.startSpatialSelection, 0);
            }}
            onClickImportPolygon={(files: FileList | null) => {
              window.setTimeout(() => { if (files) { this.cesiumAdapter.doImportPolygon(files); } }, 0);
            }}
            onClickExportPolygon={() => { this.exportPolygon(); }}
            disableExport={this.props.spatialSelection == null}
            onClickReset={() => {
              this.cesiumAdapter.clearSpatialSelection();
              window.setTimeout(() => { this.cesiumAdapter.clearBoundingBox(); }, 0);
              if (this.props.collectionSpatialCoverage !== null) {
                const flyToRectangle = this.props.collectionSpatialCoverage;
                this.cesiumAdapter.setFlyToRect(flyToRectangle);
              }
            }}
            disableReset={!this.hasSpatialFilter()}
          />
          <div id="credit" />
        </div>
      </div>
    );
  }

  private hasSpatialFilter = () => {
    return this.props.spatialSelection ||
      !this.props.boundingBox.equals(this.props.collectionSpatialCoverage);
  }

  private updateBoundingBox = (boundingBox: BoundingBox) => {
    this.props.onBoundingBoxChange(boundingBox);
    this.cesiumAdapter.setFlyToRect(boundingBox);
  }

  private startSpatialSelection = () => {
    this.cesiumAdapter.startSpatialSelection();
    CesiumUtils.setCursorCrosshair();
  }

  private updateSpatialSelection = (spatialSelection: IGeoJsonPolygon) => {
    this.props.onSpatialSelectionChange(spatialSelection);
    this.cesiumAdapter.setFlyToSpatialSelection(spatialSelection);
    CesiumUtils.unsetCursorCrosshair();
  }

  private updateLonLat = (lonLatLabel: string) => {
    this.setState({ lonLatLabel });
  }

  private enableLonLat = (lonLatEnable: boolean) => {
    this.setState({ lonLatEnable });
  }

  private exportPolygon = () => {
    if (this.props.spatialSelection) {
      const polygon = JSON.stringify(this.props.spatialSelection, null, 2);
      const file = new Blob([polygon], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(file);
      a.download = "nsidc-polygon.json";
      // Append the element to the dom so it will work in Firefox
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  }
}
