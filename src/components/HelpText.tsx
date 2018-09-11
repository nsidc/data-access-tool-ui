import * as React from "react";
import * as resetImg from "../img/glyphicons_067_cleaning.png";
import * as polygonImg from "../img/glyphicons_096_vector_path_polygon.png";

export class HelpText extends React.Component {
  public render() {
    return (
      <div className="help-text">
        <h3>Limit spatially by drawing a polygon:</h3>
        <span>Note: Blue-green overlay shows coverage, unless global.</span>
        <section>
          <ul>
            <li>Zoom: Scroll or two-finger drag</li>
            <li>Rotate: Click and drag globe</li>
            <li>Begin: Click <img src={polygonImg} alt="the polygon" /> icon to start</li>
          </ul>
          <ul>
            <li>Draw: Click on desired points</li>
            <li>Finish drawing: Double-click</li>
            <li>Clear: Click <img src={resetImg} alt="the cleanup" /> icon</li>
          </ul>
          <ul>
            <li>Edit: Click on a point</li>
            <li>Move: Click and move or type</li>
            <li>Finish: Click or press <kbd>Enter</kbd></li>
          </ul>
        </section>
      </div>
    );
  }
}
