import * as moment from "moment";
import * as React from "react";
import { ISpatialSelection } from "../SpatialSelection";

import { granuleRequest } from "../CMR";

interface ISubmitButtonProps {
  collectionId: string;
  spatialSelection: ISpatialSelection;
  temporalLowerBound: moment.Moment;
  temporalUpperBound: moment.Moment;
  onGranuleResponse: any;
}

interface ISubmitButtonState {
  cmrResponse: any;
}

export class SubmitBtn extends React.Component<ISubmitButtonProps, ISubmitButtonState> {
  public constructor(props: any) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleCmrResponse = this.handleCmrResponse.bind(this);
    this.state = {
      cmrResponse: null,
    };
  }

  public render() {
    return (
      <button className="submit-button" onClick={this.handleClick}>Search</button>
    );
  }

  private handleCmrResponse(cmrResponseJSON: any) {
    this.setState({"cmrResponse": cmrResponseJSON.feed.entry});
    this.props.onGranuleResponse(this.state.cmrResponse);
  }

  private handleClick() {
    if (this.props.collectionId
        && this.props.spatialSelection
        && this.props.temporalLowerBound
        && this.props.temporalUpperBound) {
      granuleRequest(
        this.props.collectionId,
        this.props.spatialSelection,
        this.props.temporalLowerBound,
        this.props.temporalUpperBound
      ).then(json => this.handleCmrResponse(json));
    } else {
      console.log("Insufficient props provided.");
    }
    return;
  }
}
