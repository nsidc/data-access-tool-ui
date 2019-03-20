import { faDrawPolygon } from "@fortawesome/free-solid-svg-icons";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
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
        <span>Blue-green overlay shows spatial coverage, unless dataset is global.</span>
        <section>
          <div>
            <strong>Zoom:</strong> Scroll or two-finger drag<br/>
            <strong>Rotation:</strong> Drag globe<br/>
                <strong>Begin:</strong> Click <FontAwesomeIcon icon={faDrawPolygon} size="lg" /> icon to start<br/>
            <strong>Draw:</strong> Click (do not drag) to set each point<br/>
              </div>
          <div>
            <strong>Finish:</strong> Double click<br/>
                <strong>Clear:</strong> Click <FontAwesomeIcon icon={faTrashAlt} size="lg" />{" "}
              to delete polygon, remove spatial filter<br/>
            <strong>Edit:</strong> Click to select point; click again to activate<br/>
            <strong>Move:</strong> Drag point or edit lat/lon in box, then click or <kbd>Enter</kbd><br/>
          </div>
        </section>
       </div>
      </div>
     </div>
    );
  }
}
