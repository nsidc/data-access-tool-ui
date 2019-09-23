import { faUndoAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";

import { hasChanged } from "../utils/hasChanged";

interface IBoundingBoxFilterProps {
  onClick: any;
}

export class BoundingBoxFilter extends React.Component<IBoundingBoxFilterProps, {}> {
  public shouldComponentUpdate(nextProps: IBoundingBoxFilterProps) {
    return hasChanged(this.props, nextProps, ["fromDate", "toDate",
      "timeErrorLowerBound", "timeErrorUpperBound"]);
  }

  public render() {
    // Notes for future CSS warriors: As of this writing, React responds to an
    // attempt to add a container around the labels and DatePicker (i.e., by
    // enclosing them in a div or section) by adding additional markup which
    // makes it really tricky to render the labels and input fields as inline
    // items, while still showing the calendar popups correctly.
    return (
      <div id="temporal-selection">
        <h3>Filter by bounding box:</h3>
        <label className="from">From</label>
        <div onClick={this.props.onClick}>
          <button className="buttonReset" data-tip="Reset bounding box to default">
            <FontAwesomeIcon icon={faUndoAlt} size="lg" />
          </button>
        </div>
      </div>
    );
  }
}
