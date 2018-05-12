import * as React from "react";

import { SpatialSelectionToolbar } from "./SpatialSelectionToolbar";

let Cesium = require("cesium/Cesium");
require("cesium/Widgets/widgets.css");

interface GlobeProps {
  onSpatialSelectionChange: any
}

export class Globe extends React.Component<GlobeProps, {}> {
  constructor(props: any) {
    super(props);
    this.globeEventHandler = this.globeEventHandler.bind(this);
    this.startSelectionHandler = this.startSelectionHandler.bind(this);
    this.finishSelectionHandler = this.finishSelectionHandler.bind(this);
    this.state = {
      scene: null,
      viewer: null,
      handler: null
    }
  }

  startSelectionHandler(shape: string) {
    console.log("start drawing " + shape);
  }

  finishSelectionHandler(name: any, position: any) {
    console.log("event on globe: " + name + " position: " + position);
    this.props.onSpatialSelectionChange();
  }

  globeEventHandler(name: any, position: any) {
    console.log("event on globe: " + name + " position: " + position);
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
        this.setState({
          viewer: cesiumViewer,
          scene: cesiumViewer.scene,
        })

        var _self = this;
        var scene = cesiumViewer.scene
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
    }

    render() {
        return (
            <div id="globe">
              <SpatialSelectionToolbar onShapeClick={this.startSelectionHandler} />
            </div>
        );
    }
}
