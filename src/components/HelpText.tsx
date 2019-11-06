import * as React from "react";

export class HelpText extends React.Component {
  public render() {
    return (
      <div>
        <h3 className="helpHeader">Filter spatially by drawing a bounding box or polygon:</h3>
        <span className="note">Note: Blue-green overlay shows the dataset coverage, unless it is global.</span>
      </div>
    );
  }
}
