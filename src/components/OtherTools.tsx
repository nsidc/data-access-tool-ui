import * as React from "react";

import "./Toolbar.css";

let Cesium = require("cesium/Cesium");
let cesiumWidget = require("cesium/Widgets/widgets.css");
let square = require("./img/glyphicons_094_vector_path_square.png");
let reset = require("./img/glyphicons_067_cleaning.png");

export class SquareTool extends React.Component {
    displayName = "SquareTool";

    constructor(props: any) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e: any) {
      console.log("clicked square");
    }

    render() {
      return (
        <div className="button" onClick={this.handleClick}><img src={square}/></div>
      );
    }
}

export class ResetTool extends React.Component {
    displayName = "ResetTool";

    constructor(props: any) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e: any) {
      console.log("clicked reset");
    }

    render() {
      return (
        <div className="button" onClick={this.handleClick}><img src={reset}/></div>
      );
    }
}
