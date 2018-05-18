import * as React from "react";

import { ISpatialSelection } from "../SpatialSelection";
import { SpatialSelectionToolbar } from "./SpatialSelectionToolbar";

/* tslint:disable:no-var-requires */
const Cesium = require("cesium/Cesium");
require("cesium/Widgets/widgets.css");
/* tslint:enable:no-var-requires */

interface IGlobeProps {
  spatialSelection: ISpatialSelection;
  onSpatialSelectionChange: (s: ISpatialSelection) => void;
}

interface IGlobeState {
  scene: any;
  viewer: any;
  positions: any;
  defaultShapeOptions: any;
  selectionEnd: any;
  selectionEndTest: any;
  selectionIsDone: boolean;
  primitiveBuilder: any;
}

export class Globe extends React.Component<IGlobeProps, IGlobeState> {
  public constructor(props: IGlobeProps) {

    super(props);

    this.handleSelectionStart = this.handleSelectionStart.bind(this);
    this.handlePolygonEnd = this.handlePolygonEnd.bind(this);
    this.handleLeftClick = this.handleLeftClick.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.polygonPrimitiveBuilder = this.polygonPrimitiveBuilder.bind(this);
    this.extentPrimitiveBuilder = this.extentPrimitiveBuilder.bind(this);
    this.polygonGeometryBuilder = this.polygonGeometryBuilder.bind(this);
    this.extentGeometryBuilder = this.extentGeometryBuilder.bind(this);
    this.polygonEndTest = this.polygonEndTest.bind(this);
    this.extentEndTest = this.extentEndTest.bind(this);

    this.state = {
      defaultShapeOptions: {
        appearance: new Cesium.EllipsoidSurfaceAppearance({
            aboveGround : false,
        }),
        asynchronous: true,
        debugShowBoundingVolume: false,
        ellipsoid: Cesium.Ellipsoid.WGS84,
        granularity: Math.PI / 180.0,
        height: 0.0,
        material: Cesium.Material.fromType(Cesium.Material.ColorType),
        show: true,
        textureRotationAngle: 0.0,
      },
      positions: [],
      primitiveBuilder: null,
      scene: null,
      selectionEnd: null,
      selectionEndTest: null,
      selectionIsDone: false,
      viewer: null,
    };
  }

  public componentDidMount() {
    const cesiumViewer = new Cesium.Viewer("globe", {
            animation: false,
            baseLayerPicker: false,
            fullscreenButton: false,
            geocoder: false,
            homeButton: false,
            infoBox: false,
            navigationHelpButton: false,
            navigationInstructionsInitiallyVisible: false,
            scene3DOnly: true,
            sceneModePicker: false,
            selectionIndicator: false,
            timeline: false,
    });

    const scene = cesiumViewer.scene;
    const self = this;

    const handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    handler.setInputAction(
      (movement: any) => self.handleLeftClick("leftClick", movement.position),
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
    );
    handler.setInputAction(
      (movement: any) => self.handlePolygonEnd("leftDoubleClick", movement.position),
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
    );

    const positions = this.rectangleFromSpatialSelection(this.props.spatialSelection);
    this.handleSelectionStart("square");

    console.log("positions in cesium init: " + positions);
    this.setState({
      positions,
      scene,
      viewer: cesiumViewer,
    });
  }

  public render() {
    // Display extent on Cesium globe
    this.showSpatialSelection();

    return (
      <div id="spatial-selection">
        <div id="globe"></div>
        <SpatialSelectionToolbar onSelectionStart={this.handleSelectionStart} onResetClick={this.handleReset} />
      </div>
    );
  }

  private handleReset() {
    console.log("Reset spatial selection");

    // Is this breaking rules about using "this.state" to set state?
    this.state.scene.primitives.removeAll();
    this.setState({
      positions: [],
      selectionEnd: null,
    });
  }

  private handleSelectionStart(name: string) {
    console.log("Start drawing " + name);
    let selectionEnd = null;
    let selectionEndTest = null;
    let builder = null;

    if (name === "polygon") {
      selectionEnd = this.handlePolygonEnd;
      selectionEndTest = this.polygonEndTest;
      builder = this.polygonPrimitiveBuilder;
    } else {
      selectionEnd = this.handleLeftClick;
      selectionEndTest = this.extentEndTest;
      builder = this.extentPrimitiveBuilder;
    }
    this.setState({
      positions: [],
      primitiveBuilder: builder,
      selectionEnd,
      selectionEndTest,
      selectionIsDone: false,
    });
  }

  // Polygon ends with a double-left click, so always return false when testing
  // "polygon end" from any other action.
  // TODO Still need to remove extra entry (due to double click) from positions array
  private polygonEndTest(action: string) {
    console.log("test for polygon end");
    if ((action === "leftDoubleClick") && this.state.positions && (this.state.positions.length >= 4)) {
      console.log("state: " + this.state);
      return true;
    } else {
      return false;
    }
  }

  private extentEndTest(action: string) {
    if (this.state && this.state.positions && (this.state.positions.length === 2 )) {
      console.log("extent end is true");
      return true;
    } else {
      return false;
    }
  }

  private handlePolygonEnd(name: string, position: any) {
    if (this.selectionOff()) {
      return;
    }
    console.log("finish event on globe: " + name + " position: " + position);
    if (this.state.selectionEndTest(name) === true) {
      this.setState({
        selectionIsDone: true,
      });
    } else {
      this.savePosition(position);
    }
  }

  private showSpatialSelection() {
      if (this.state.positions.length > 0 &&
      this.state.scene &&
      this.state.primitiveBuilder) {
        console.log("adding primitive");

        // Is this technically changing the state?
        this.state.scene.primitives.add(this.state.primitiveBuilder());
      }
  }

  private polygonPrimitiveBuilder() {
    console.log("in polygon primitive builder");
    return this.genericPrimitiveBuilder("polygon", this.polygonGeometryBuilder);
  }

  private polygonGeometryBuilder() {
    // TODO: get rid of duplicate points (e.g. from double click)
    const positions = this.state.positions;
    console.log("positions: " + positions);

    return new Cesium.PolygonGeometry.fromPositions({
      height : this.state.defaultShapeOptions.height,
      positions,
      stRotation : this.state.defaultShapeOptions.textureRotationAngle,
      vertexFormat : Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
    });
  }

  private extentPrimitiveBuilder() {
    console.log("in extent primitive builder");
    return this.genericPrimitiveBuilder("square", this.extentGeometryBuilder);
  }

  private extentGeometryBuilder() {
    const positions = this.state.positions;
    console.log("positions in extent geometry: " + positions);

    const rectangle = new Cesium.Rectangle.fromCartesianArray(positions);
    return new Cesium.RectangleGeometry({
      ellipsoid: this.state.defaultShapeOptions.ellipsoid,
      granularity: this.state.defaultShapeOptions.granularity,
      height: this.state.defaultShapeOptions.height,
      rectangle,
      stRotation: this.state.defaultShapeOptions.textureRotationAngle,
      vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
    });
  }

  private genericPrimitiveBuilder(name: any, geometryBuilder: any) {
    const geometry = geometryBuilder();

    return new Cesium.GroundPrimitive({
      geometryInstances: new Cesium.GeometryInstance({
        attributes: {
          color : new Cesium.ColorGeometryInstanceAttribute(0.0, 1.0, 1.0, 0.5),
        },
        geometry,
        id: {name},
      }),
    });
  }

  // Save selected point
  private handleLeftClick(name: string, position: any) {
    console.log("event on globe: " + name + " position: " + position);
    if (this.selectionOff()) {
      return;
    }
    this.savePosition(position);
    if (this.state.selectionEndTest(name) === true) {
      this.setState({selectionIsDone: true});
    }
  }

  private savePosition(position: any) {
    const scene = this.state.scene;
    const ellipsoid = this.state.defaultShapeOptions.ellipsoid;
    const cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
    if (cartesian) {
      console.log("add point " + cartesian);
      this.state.positions.push(cartesian);
    }
  }

  // TODO Alert user if they haven't selected a shape
  private selectionOff() {
    if (this.state.selectionIsDone && this.state.selectionEnd) {
      console.log("Globe clicked, but no shape selected");
      return true;
    }
    return false;
  }

  // @ts-ignore: TS6133; positionsFromSpatialSelection declared and not called
  // Should this functionality be part of the spatialSelection class itself?
  private positionsFromSpatialSelection(spatialSelection: ISpatialSelection) {
    const degArray = [
      spatialSelection.lower_left_lon, spatialSelection.lower_left_lat, 0,
      spatialSelection.lower_left_lon, spatialSelection.upper_right_lat, 0,
      spatialSelection.upper_right_lon, spatialSelection.upper_right_lat, 0,
      spatialSelection.upper_right_lon, spatialSelection.lower_left_lat, 0,
      spatialSelection.lower_left_lon, spatialSelection.lower_left_lat, 0,
    ];
    return Cesium.Cartesian3.fromDegreesArrayHeights(degArray);
  }

  private rectangleFromSpatialSelection(spatialSelection: ISpatialSelection) {
    const degArray = [
        spatialSelection.lower_left_lon, spatialSelection.lower_left_lat, 0,
        spatialSelection.upper_right_lon, spatialSelection.upper_right_lat, 0,
    ];
    return Cesium.Cartesian3.fromDegreesArrayHeights(degArray);
  }
}
