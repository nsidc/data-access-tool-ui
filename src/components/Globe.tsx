import * as React from "react";

import { SpatialSelectionToolbar } from "./SpatialSelectionToolbar";
import {polyfill} from "es6-promise";

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
}

export class Globe extends React.Component<GlobeProps, GlobeState> {
  constructor(props: any) {
    super(props);
    this.handleSelectionStart = this.handleSelectionStart.bind(this);
    this.handleSelectionEnd = this.handleSelectionEnd.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleGlobeEvent = this.handleGlobeEvent.bind(this);
    this.handleLeftClick = this.handleLeftClick.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.polygonPrimitiveBuilder = this.polygonPrimitiveBuilder.bind(this);
    this.extentPrimitiveBuilder = this.extentPrimitiveBuilder.bind(this);
    this.polygonGeometryBuilder = this.polygonGeometryBuilder.bind(this);
    this.extentGeometryBuilder = this.extentGeometryBuilder.bind(this);

    this.state = {
      scene: null,
      viewer: null,
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
    this.setState({primitiveBuilder: null});
  }

  handleSelectionStart(name: string) {
    console.log("Start drawing " + name);
    let primitiveBuilder = (name === "polygon") ? this.polygonPrimitiveBuilder : this.extentPrimitiveBuilder;
    this.setState({
      primitiveBuilder: primitiveBuilder
    });
  }

  handleSelectionEnd(name: string, position: any) {
    console.log("finish event on globe: " + name + " position: " + position);

    if (this.state.primitiveBuilder === null) {
      this.setState({
        positions: []
      });
      return;
    }

    let scene = this.state.scene;
    let primitive = this.state.primitiveBuilder();

    // Is this technically changing the state?
    scene.primitives.add(primitive);

    this.setState({
      primitiveBuilder: null,
      positions: []
    });
    this.props.onSpatialSelectionChange();
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
    // TODO: get rid of duplicates (e.g. from double click)
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

  extentPrimitiveBuilder() {
    console.log("in extent primitive builder");

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

  extentGeometryBuilder() {
    // TODO: get rid of duplicates (e.g. from double click)
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

  handleGlobeEvent(name: string, position: any) {
    console.log("event on globe: " + name + " position: " + position);
  }

  // Save selected point
  handleLeftClick(name: string, position: any) {
    console.log("event on globe: " + name + " position: " + position);
    let scene = this.state.scene;
    let ellipsoid = this.state.defaultShapeOptions.ellipsoid;
    let cartesian = scene.camera.pickEllipsoid(position, ellipsoid);

    if (cartesian) {
      console.log("add point " + cartesian);
      this.state.positions.push(cartesian);
    }
  }

  handleMouseMove(name: string, position: any) {
   // console.log("mouse moved to " + position);
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

    // not sure this is the best place to update the state, since there's no
    // need to re-render in this case.
    let scene = cesiumViewer.scene;
    this.setState({
      viewer: cesiumViewer,
      scene: scene,
    });

    let _self = this;

    let handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    handler.setInputAction(
      function (movement: any) {
        _self.handleLeftClick("leftClick", movement.position);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.setInputAction(
      function (movement: any) {
        _self.handleSelectionEnd("leftDoubleClick", movement.position);
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    handler.setInputAction(
      function (movement: any) {
        _self.handleGlobeEvent("leftUp", movement.position);
    }, Cesium.ScreenSpaceEventType.LEFT_UP);
    handler.setInputAction(
      function (movement: any) {
        _self.handleGlobeEvent("leftDown", movement.position);
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    handler.setInputAction(
      function (movement: any) {
        _self.handleMouseMove("mouseMove", movement.position);
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
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
