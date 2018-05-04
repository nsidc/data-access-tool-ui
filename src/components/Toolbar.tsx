import * as React from "react";

// let DrawHelper = require("./DrawHelper");
import "./DrawHelper.css";

let img = require("./img/glyphicons_096_vector_path_polygon.png");

export class Toolbar extends React.Component {
    constructor(props: any) {
        super(props);
    }

    render() {
      return (
        <div id="toolbar"><img src={img}/></div>
      );
    }
}
