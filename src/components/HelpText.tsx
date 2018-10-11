import * as React from "react";
import * as resetImg from "../img/glyphicons_067_cleaning.png";
import * as polygonImg from "../img/glyphicons_096_vector_path_polygon.png";

export class HelpText extends React.Component {
  public render() {
    return (
      <div>
      <div className="show-hide-instructions">
        <a className="toggle"><strong>Instructions</strong></a>
      </div>
      <div className="help-text">
        <h3>Limit spatially by drawing a polygon:</h3>
        <div className="show-hide-div" id="help-text">
        <span>Blue-green overlay shows spatial coverage, unless dataset is global.</span>
        <section>
          <ul>
            <li><strong>Zoom:</strong> Scroll or two-finger drag</li>
            <li><strong>Rotation:</strong> Drag globe</li>
            <li><strong>Begin:</strong> Click <img src={polygonImg} alt="the polygon" /> icon to start</li>
            <li><strong>Draw:</strong> Click (do not drag) to set each point</li>
          </ul>
          <ul>
            <li><strong>Finish:</strong> Double click</li>
            <li><strong>Clear:</strong> Click <img src={resetImg} alt="the cleanup" /> icon</li>
            <li><strong>Edit:</strong> Click to select point; click again to activate</li>
            <li><strong>Move:</strong> Drag point or edit lat/lon in box, then click or <kbd>Enter</kbd></li>
          </ul>
        </section>
       </div>
      </div>
     </div>
    );
  }
}
