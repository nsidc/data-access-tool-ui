import * as moment from "moment";
import * as React from "react";

interface SubmitButtonProps {
  collectionId: string;
  temporalLowerBound: moment.Moment;
  temporalUpperBound: moment.Moment;
}

class Component extends React.Component<SubmitButtonProps, {}> {
  displayName = "SubmitBtn";

  constructor(props: any) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.CmrRequest = this.CmrRequest.bind(this);
  }

  CmrRequest(collectionId: string, temporalLowerBound: moment.Moment, temporalUpperBound: moment.Moment) {
    console.log(`Request to CMR with: ${collectionId}, ${temporalLowerBound}, ${temporalUpperBound}`);
  }

  handleClick() {
    if (this.props.collectionId && this.props.temporalLowerBound && this.props.temporalUpperBound) {
      this.CmrRequest(this.props.collectionId, this.props.temporalLowerBound, this.props.temporalUpperBound);
    } else {
      console.log("Insufficient props provided.");
    }
    return;
  }

  render() {
    return (
      <div id="submit-container">
        <button onClick={this.handleClick}>Submit</button>
      </div>
    );
  }
}

export default Component;
