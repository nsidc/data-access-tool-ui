import { faDrawPolygon } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";

export class HelpText extends React.Component {
  public render() {
    return (
      <div>
      <div className="show-hide-instructions">
        <a className="toggle"><strong>Instructions</strong></a>
      </div>
      <div className="help-text">
        <h3>Filter spatially by drawing a polygon:</h3>
        <div className="show-hide-div" id="help-text">
        <span className="note">Note: Blue-green overlay shows coverage, unless global.</span>
        <section>
          <div>
            Drag/zoom to area of interest, then
            <ul>
              <li>Click <FontAwesomeIcon icon={faDrawPolygon} size="lg" /> to start</li>
              <li>Click (don't drag) to set points</li>
              <li>Double click to finish</li>
            </ul>
          </div>
          <div>
            To move a point, click to turn green, then
            <ul>
              <li>edit lat/lon box directly, or</li>
              <li>click again to begin moving, and</li>
              <li>click again to set new location</li>
            </ul>
          </div>
        </section>
       </div>
      </div>
     </div>
    );
  }
}
