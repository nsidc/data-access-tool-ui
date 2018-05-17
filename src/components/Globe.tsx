import * as React from "react";

import { SpatialSelection } from "../SpatialSelection";
import { SpatialSelectionToolbar } from "./SpatialSelectionToolbar";
import {polyfill} from "es6-promise";
import {Simulate} from "react-dom/test-utils";
import select = Simulate.select;

let Cesium = require("cesium/Cesium");
require("cesium/Widgets/widgets.css");

interface GlobeProps {
  spatialSelection: SpatialSelection;
  onSpatialSelectionChange: any;
}

interface GlobeState {
  scene: any;
  viewer: any;
  positions: any;
  defaultShapeOptions: any;
  selectionEnd: any;
  selectionEndTest: any;
  selectionIsDone: boolean;
  primitiveBuilder: any;
}

export class Globe extends React.Component<GlobeProps, GlobeState> {
  constructor(props: any) {
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
      scene: null,
      viewer: null,
      selectionEnd: null,
      selectionEndTest: null,
      selectionIsDone: false,
      primitiveBuilder: null,
      positions: [],
      defaultShapeOptions: {
        ellipsoid: Cesium.Ellipsoid.WGS84,
        textureRotationAngle: 0.0,
        height: 0.0,
        asynchronous: true,
        show: true,
        debugShowBoundingVolume: false,
        appearance: new Cesium.EllipsoidSurfaceAppearance({
            aboveGround : false
        }),
        material: Cesium.Material.fromType(Cesium.Material.ColorType),
        granularity: Math.PI / 180.0
      }
    };
  }

  handleReset() {
    console.log("Reset spatial selection");

    // Is this breaking rules about using "this.state" to set state?
    this.state.scene.primitives.removeAll();
    this.setState({
      selectionEnd: null,
      positions: []
    });
  }

  handleSelectionStart(name: string) {
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
      selectionEnd: selectionEnd,
      selectionEndTest: selectionEndTest,
      primitiveBuilder: builder,
      selectionIsDone: false,
      positions: []
    });
  }

  // Polygon ends with a double-left click, so always return false when testing
  // "polygon end" from any other action.
  // TODO Still need to remove extra entry (due to double click) from positions array
  polygonEndTest(action: string) {
    console.log("test for polygon end");
    if ((action === "leftDoubleClick") && this.state.positions && (this.state.positions.length >= 4)) {
      console.log("state: " + this.state);
      return true;
    } else {
      return false;
    }
  }

  extentEndTest(action: string) {
    if (this.state && this.state.positions && (this.state.positions.length === 2 )) {
      console.log("extent end is true");
      return true;
    } else {
      return false;
    }
  }

  handlePolygonEnd(name: string, position: any) {
    if (this.selectionOff()) {
      return;
    }
    console.log("finish event on globe: " + name + " position: " + position);
    if (this.state.selectionEndTest(name) === true) {
      this.setState({
        selectionIsDone: true
      });
    } else {
      this.savePosition(position);
    }
  }

  showSpatialSelection() {
      if (this.state.positions.length > 0 &&
      this.state.scene &&
      this.state.primitiveBuilder) {
        console.log("adding primitive");

        // Is this technically changing the state?
        this.state.scene.primitives.add(this.state.primitiveBuilder());
      }
  }

  polygonPrimitiveBuilder() {
    console.log("in polygon primitive builder");
    return this.genericPrimitiveBuilder("polygon", this.polygonGeometryBuilder);
  }

  polygonGeometryBuilder() {
    // TODO: get rid of duplicate points (e.g. from double click)
    let positions = this.state.positions;
    console.log("positions: " + positions);

    return new Cesium.PolygonGeometry.fromPositions({
      positions : positions,
      height : this.state.defaultShapeOptions.height,
      vertexFormat : Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
      stRotation : this.state.defaultShapeOptions.textureRotationAngle,
      ellipsoid : this.state.defaultShapeOptions.ellipsoid,
      granularity : this.state.defaultShapeOptions.granularity
    });
  }

  extentPrimitiveBuilder() {
    console.log("in extent primitive builder");
    return this.genericPrimitiveBuilder("square", this.extentGeometryBuilder);
  }

  extentGeometryBuilder() {
    let positions = this.state.positions;
    console.log("positions in extent geometry: " + positions);

    let rectangle = new Cesium.Rectangle.fromCartesianArray(positions);
    return new Cesium.RectangleGeometry({
      rectangle: rectangle,
      ellipsoid: this.state.defaultShapeOptions.ellipsoid,
      granularity: this.state.defaultShapeOptions.granularity,
      height: this.state.defaultShapeOptions.height,
      vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
      stRotation: this.state.defaultShapeOptions.textureRotationAngle,
    });
  }

  genericPrimitiveBuilder(name: any, geometryBuilder: any) {
    let geometry = geometryBuilder();

    return new Cesium.GroundPrimitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: geometry,
        id: {name},
        attributes: {
          color : new Cesium.ColorGeometryInstanceAttribute(0.0, 1.0, 1.0, 0.5)
        }
      }),
    });
  }

  // Save selected point
  handleLeftClick(name: string, position: any) {
    console.log("event on globe: " + name + " position: " + position);
    if (this.selectionOff()) {
      return;
    }
    this.savePosition(position);
    if (this.state.selectionEndTest(name) === true) {
      this.setState({selectionIsDone: true});
    }
  }

  savePosition(position: any) {
    let scene = this.state.scene;
    let ellipsoid = this.state.defaultShapeOptions.ellipsoid;
    let cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
    if (cartesian) {
      console.log("add point " + cartesian);
      this.state.positions.push(cartesian);
    }
  }

  // TODO Alert user if they haven't selected a shape
  selectionOff() {
    if (this.state.selectionIsDone && this.state.selectionEnd) {
      console.log("Globe clicked, but no shape selected");
      return true;
    }
    return false;
  }

  componentDidMount() {
    let cesiumViewer = new Cesium.Viewer("globe", {
            animation: false,
            baseLayerPicker: false,
            fullscreenButton: false,
            geocoder: false,
            homeButton: false,
            infoBox: false,
            sceneModePicker: false,
            scene3DOnly: true,
            selectionIndicator: false,
            timeline: false,
            navigationHelpButton: false,
            navigationInstructionsInitiallyVisible: false
    });

    let scene = cesiumViewer.scene;
    let _self = this;

    let handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    handler.setInputAction(
      function (movement: any) {
        _self.handleLeftClick("leftClick", movement.position);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.setInputAction(
      function (movement: any) {
        _self.handlePolygonEnd("leftDoubleClick", movement.position);
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    let positions = this.rectangleFromSpatialSelection(this.props.spatialSelection);
    this.handleSelectionStart("square");

    console.log("positions in cesium init: " + positions);
    this.setState({
      viewer: cesiumViewer,
      scene: scene,
      positions: positions,
    });
  }

  // Should this functionality be part of the spatialSelection class itself?
  positionsFromSpatialSelection(spatialSelection: SpatialSelection) {
    let degArray = [
      spatialSelection.lower_left_lon, spatialSelection.lower_left_lat, 0,
      spatialSelection.lower_left_lon, spatialSelection.upper_right_lat, 0,
      spatialSelection.upper_right_lon, spatialSelection.upper_right_lat, 0,
      spatialSelection.upper_right_lon, spatialSelection.lower_left_lat, 0,
      spatialSelection.lower_left_lon, spatialSelection.lower_left_lat, 0,
    ];
    return Cesium.Cartesian3.fromDegreesArrayHeights(degArray);
  }

  rectangleFromSpatialSelection(spatialSelection: SpatialSelection) {
    let degArray = [
        spatialSelection.lower_left_lon, spatialSelection.lower_left_lat, 0,
        spatialSelection.upper_right_lon, spatialSelection.upper_right_lat, 0
    ];
    return Cesium.Cartesian3.fromDegreesArrayHeights(degArray);
  }

  render() {
    // Display extent on Cesium globe
    this.showSpatialSelection();

    return (
      <div id="spatial-selection">
        <div id="globe"></div>
        <SpatialSelectionToolbar onSelectionStart={this.handleSelectionStart} onResetClick={this.handleReset} />
      </div>
    );
  }
}
