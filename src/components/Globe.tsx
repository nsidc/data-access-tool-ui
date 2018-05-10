import * as React from "react";

import { Toolbar } from "./Toolbar";

let Cesium = require("cesium/Cesium");
require("cesium/Widgets/widgets.css");

export class Globe extends React.Component<{}, {}> {
    componentDidMount() {
        new Cesium.Viewer("globe", {
            animation: false,
            baseLayerPicker: false,
            fullscreenButton: false,
            geocoder: false,
            homeButton: false,
            infoBox: false,
            sceneModePicker: false,
            selectionIndicator: false,
            timeline: false,
            navigationHelpButton: false,
            navigationInstructionsInitiallyVisible: false
        });
    }

    render() {
        return (
            <div id="globe">
              <Toolbar/>
            </div>
        );
    }
}
