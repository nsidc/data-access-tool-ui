import * as moment from "moment";
import * as React from "react";

import { granuleRequest } from "../CMR";


interface SubmitButtonProps {
  collectionId: string;
  temporalLowerBound: moment.Moment;
  temporalUpperBound: moment.Moment;
  onGranuleResponse: any;
}

interface SubmitButtonState {
  cmrResponse: any;
}

class Component extends React.Component<SubmitButtonProps, SubmitButtonState> {
  displayName = "SubmitBtn";

  constructor(props: any) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleCmrResponse = this.handleCmrResponse.bind(this);
    this.state = {
      cmrResponse: null
    };
  }

  handleCmrResponse(cmrResponseJSON: any) {
    this.setState({"cmrResponse": cmrResponseJSON.feed.entry});
    this.props.onGranuleResponse(this.state.cmrResponse);
  }

  handleClick() {
    if (this.props.collectionId && this.props.temporalLowerBound && this.props.temporalUpperBound) {
      granuleRequest(this.props.collectionId, this.props.temporalLowerBound, this.props.temporalUpperBound)
        .then(json => this.handleCmrResponse(json));
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
