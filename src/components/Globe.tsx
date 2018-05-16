import * as React from "react";

import { SpatialSelectionToolbar } from "./SpatialSelectionToolbar";
import {polyfill} from "es6-promise";
import {Simulate} from "react-dom/test-utils";
import select = Simulate.select;

let Cesium = require("cesium/Cesium");
require("cesium/Widgets/widgets.css");

interface GlobeProps {
  onSpatialSelectionChange: any;
}

interface GlobeState {
  scene: any;
  viewer: any;
  positions: any;
  defaultShapeOptions: any;
  primitiveBuilder: any;
  selectionEnd: any;
  selectionEndTest: any;
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
      primitiveBuilder: null,
      selectionEnd: null,
      selectionEndTest: null,
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
    this.setState({primitiveBuilder: null});
  }

  handleSelectionStart(name: string) {
    console.log("Start drawing " + name);
    let builder = null;
    let selectionEnd = null;
    let selectionEndTest = null;

    if (name === "polygon") {
      builder = this.polygonPrimitiveBuilder;
      selectionEnd = this.handlePolygonEnd;
      selectionEndTest = this.polygonEndTest;
    } else {
      builder = this.extentPrimitiveBuilder;
      selectionEnd = this.handleLeftClick;
      selectionEndTest = this.extentEndTest;
    }
    this.setState({
      primitiveBuilder: builder,
      selectionEnd: selectionEnd,
      selectionEndTest: selectionEndTest
    });
  }

  // Polygon ends with a double-left click, so always return false when testing
  // "polygon end" from a single left click.
  polygonEndTest() {
    console.log("test for polygon end");
    return false;
  }

  // temporary use of 3 or more points until extent drawing is in place
  extentEndTest() {
    if (this.state.positions.length > 2) {
      console.log("extent end is true");
      return true;
    } else {
      return false;
    }
  }

  handlePolygonEnd(name: string, position: any) {
    console.log("finish event on globe: " + name + " position: " + position);
    if (this.selectionOff()) {
      return;
    }
    this.showSpatialSelection();
  }

  showSpatialSelection() {
    let scene = this.state.scene;
    let primitive = this.state.primitiveBuilder();

    // Is this technically changing the state?
    scene.primitives.add(primitive);

    this.props.onSpatialSelectionChange(this.state.positions);
    this.setState({
      primitiveBuilder: null,
      positions: []
    });
  }

  polygonPrimitiveBuilder() {
    console.log("in polygon primitive builder");

    let geometry = this.polygonGeometryBuilder();

    return new Cesium.GroundPrimitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: geometry,
        id: "polygon",
        attributes: {
          color : new Cesium.ColorGeometryInstanceAttribute(0.0, 1.0, 1.0, 0.5)
        }
      }),
    });
  }

  polygonGeometryBuilder() {
    // TODO: get rid of duplicate points (e.g. from double click)
    let positions = this.state.positions;
    console.log("positions: " + positions);

    return new Cesium.PolygonGeometry.fromPositions({
      // Close the loop to create a complete polygon
      positions : positions.concat([this.state.positions[0]]),
      height : this.state.defaultShapeOptions.height,
      vertexFormat : Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
      stRotation : this.state.defaultShapeOptions.textureRotationAngle,
      ellipsoid : this.state.defaultShapeOptions.ellipsoid,
      granularity : this.state.defaultShapeOptions.granularity
    });
  }

  // Currently just builds a polygon
  extentPrimitiveBuilder() {
    console.log("in extent primitive builder");

    let geometry = this.polygonGeometryBuilder();

    return new Cesium.GroundPrimitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: geometry,
        id: "square",
        attributes: {
          color : new Cesium.ColorGeometryInstanceAttribute(0.0, 1.0, 1.0, 0.5)
        }
      }),
    });
  }

  extentGeometryBuilder() {
    let positions = this.state.positions;
    console.log("positions: " + positions);

    return new Cesium.PolygonGeometry.fromPositions({
      // Close the loop to create a complete polygon
      positions : positions.concat([this.state.positions[0]]),
      height : this.state.defaultShapeOptions.height,
      vertexFormat : Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
      stRotation : this.state.defaultShapeOptions.textureRotationAngle,
      ellipsoid : this.state.defaultShapeOptions.ellipsoid,
      granularity : this.state.defaultShapeOptions.granularity
    });
  }

  // Save selected point
  handleLeftClick(name: string, position: any) {
    console.log("event on globe: " + name + " position: " + position);
    if (this.selectionOff()) {
      return;
    }
    this.savePosition(position);
    if (this.state.selectionEndTest() === true) {
      this.showSpatialSelection();
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
    if (this.state.primitiveBuilder === null) {
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

    // not sure this is the best place to update the state, since there's no
    // need to re-render in this case. Also, should these actually be "state"?
    this.setState({
      viewer: cesiumViewer,
      scene: scene,
    });
  }

  render() {
    return (
      <div id="spatial-selection">
        <div id="globe"></div>
        <SpatialSelectionToolbar onSelectionStart={this.handleSelectionStart} onResetClick={this.handleReset} />
      </div>
    );
  }
}
