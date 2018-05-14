import * as React from "react";

import { SpatialSelectionToolbar } from "./SpatialSelectionToolbar";

let Cesium = require("cesium/Cesium");
require("cesium/Widgets/widgets.css");

interface GlobeProps {
  onSpatialSelectionChange: any
}

interface GlobeState {
  scene: any,
  viewer: any,
  selectionType: any,
  positions: any,
  defaultShapeOptions: any,
}

export class Globe extends React.Component<GlobeProps, GlobeState> {
  constructor(props: any) {
    super(props);
    this.globeEventHandler = this.globeEventHandler.bind(this);
    this.startSelectionHandler = this.startSelectionHandler.bind(this);
    this.finishSelectionHandler = this.finishSelectionHandler.bind(this);
    this.state = {
      scene: null,
      viewer: null,
      selectionType: null,
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
    }
  }

  startSelectionHandler(shape: string) {
    console.log("start drawing " + shape);
    this.setState({
      selectionType: shape,
      // defaultShapeOptions.material.uniforms.color: new Cesium.Color(1.0, 1.0, 0.0, 0.5)
    });
  }

  finishSelectionHandler(name: string, position: any) {
    console.log("finish event on globe: " + name + " position: " + position);
    console.log("positions: " + this.state.positions);
    this.setState({
      selectionType: null
    });
    this.props.onSpatialSelectionChange();
  }

  // Save selected point
  globeEventHandler(name: string, position: any) {
    console.log("event on globe: " + name + " position: " + position);
    var scene = this.state.scene;
    var ellipsoid = this.state.defaultShapeOptions.ellipsoid;
    var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
    if(cartesian) {
      this.state.positions.push(cartesian);
    }
  }

  mouseMoveHandler(name: string, position: any) {
   // console.log("mouse moved to " + position);
  }

    componentDidMount() {
        var cesiumViewer = new Cesium.Viewer("globe", {
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
        var scene = cesiumViewer.scene
        this.setState({
          viewer: cesiumViewer,
          scene: scene,
        })

        var _self = this;

        var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        handler.setInputAction(
            function (movement: any) {
                _self.globeEventHandler('leftClick', movement.position);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.setInputAction(
            function (movement: any) {
                _self.finishSelectionHandler('leftDoubleClick', movement.position);
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        handler.setInputAction(
            function (movement: any) {
                _self.globeEventHandler('leftUp', movement.position);
        }, Cesium.ScreenSpaceEventType.LEFT_UP);
        handler.setInputAction(
            function (movement: any) {
                _self.globeEventHandler('leftDown', movement.position);
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
        handler.setInputAction(
            function (movement: any) {
                _self.mouseMoveHandler('mouseMove', movement.position);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    render() {
        return (
            <div id="globe">
              <SpatialSelectionToolbar onShapeClick={this.startSelectionHandler} />
            </div>
        );
    }
}
