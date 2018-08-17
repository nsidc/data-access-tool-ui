import * as React from "react";
import "../css/index.css";
import * as resetImg from "../img/glyphicons_067_cleaning.png";
import * as polygonImg from "../img/glyphicons_096_vector_path_polygon.png";
import { IGeoJsonPolygon } from "../types/GeoJson";
import { CesiumAdapter } from "../utils/CesiumAdapter";
import { hasChanged } from "../utils/hasChanged";
import { SpatialSelectionToolbar } from "./SpatialSelectionToolbar";

interface IGlobeProps {
  spatialSelection: IGeoJsonPolygon;
  resetSpatialSelection: () => void;
  onSpatialSelectionChange: (s: IGeoJsonPolygon) => void;
}

export class Globe extends React.Component<IGlobeProps, {}> {
  private cesiumAdapter: CesiumAdapter;
  private elementId = "globe";

  public constructor(props: IGlobeProps) {
    super(props);
    this.cesiumAdapter = new CesiumAdapter(this.updateSpatialSelection);
  }

  public componentDidMount() {
    this.cesiumAdapter.createViewer(this.elementId, this.props.spatialSelection);
  }

  public shouldComponentUpdate(nextProps: IGlobeProps) {
    return hasChanged(this.props, nextProps, ["spatialSelection"]);
  }

  public componentDidUpdate() {
    this.cesiumAdapter.renderInitialBoundingBox(this.props.spatialSelection);
  }

  public render() {
    // Is there a better way of managing the icons and help text, besides simply
    // embedding them here?
    return (
      <div id="spatial-selection">
        <div className="help-text">
          <h3>Limit spatially by drawing a polygon:</h3>
          <span>Note: Green overlay shows coverage, unless global.</span>
          <section>
          <ul id="left-column">
            <li>Size: Scroll or two-finger drag</li>
            <li>Rotation: Click and drag globe</li>
            <li>Begin: Click <img src={polygonImg} alt="the polygon" /> icon to start</li>
          </ul>
          <ul id="right-column">
            <li>Draw: Click on desired points</li>
            <li>Finish drawing: Double-click</li>
            <li>Clear: Click <img src={resetImg} alt="the cleanup" /> icon</li>
          </ul>
          </section>
        </div>
        <div id={this.elementId}>
          <SpatialSelectionToolbar
            onClickPolygon={() => {
              this.cesiumAdapter.clearSpatialSelection();
              this.cesiumAdapter.polygonMode.start();
              this.setCursorCrosshair();
            }}
            onClickReset={() => {
              this.cesiumAdapter.polygonMode.endMode();
              this.cesiumAdapter.clearSpatialSelection();
              this.props.resetSpatialSelection();
            }} />
          <div id="credit" />
        </div>
      </div>
    );
  }

  private setCursorCrosshair() {
    const el = document.getElementById(this.elementId);

    if (el && el.classList && el.classList.add) {
      el.classList.add("cursor-crosshair");
    }
  }

  private unsetCursorCrosshair() {
    const el = document.getElementById(this.elementId);

    if (el && el.classList && el.classList.remove) {
      el.classList.remove("cursor-crosshair");
    }
  }

  private updateSpatialSelection = (spatialSelection: IGeoJsonPolygon) => {
    this.props.onSpatialSelectionChange(spatialSelection);
    this.unsetCursorCrosshair();
  }
}
