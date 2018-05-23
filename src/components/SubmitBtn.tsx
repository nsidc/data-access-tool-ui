import * as moment from "moment";
import * as React from "react";
import { ISpatialSelection } from "../SpatialSelection";

import { granuleRequest } from "../CMR";
import { submitOrder } from "../Hermes";

interface ISubmitButtonProps {
  collectionId: string;
  spatialSelection: ISpatialSelection;
  temporalLowerBound: moment.Moment;
  temporalUpperBound: moment.Moment;
  onGranuleResponse: any;
}

interface ISubmitButtonState {
  cmrResponse?: object[];
  orderSubmissionResponse?: {[index: string]: any};
}

export class SubmitBtn extends React.Component<ISubmitButtonProps, ISubmitButtonState> {
  public constructor(props: any) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleCmrResponse = this.handleCmrResponse.bind(this);
    this.state = {
      cmrResponse: undefined,
      orderSubmissionResponse: undefined,
    };
  }

  public render() {
    let submissionResponseJSX: any = (<span>{'Submit an order, buddy!'}</span>);
    if (this.state.orderSubmissionResponse) {
      const orderState: any = this.state.orderSubmissionResponse["message"];
      submissionResponseJSX = Object.keys(orderState).map(
        (key: string, index: number) => {
          return (
            <span key={index}><b>{key}:</b>{orderState[key]}&nbsp;</span>
          );
        }
      );
    }
    return (
      <div>
        <button className="submit-button" onClick={this.handleClick}>Search</button>
        {submissionResponseJSX}
      </div>
    );
  }

  public componentDidUpdate(prevProps: ISubmitButtonProps, prevState: ISubmitButtonState) {
    if (this.state.cmrResponse && this.state.cmrResponse != prevState.cmrResponse) {
      const granuleURs: string[] = this.state.cmrResponse.map((g: any) => g["title"]);
      const collectionIDs: string[] = this.state.cmrResponse.map((g: any) => g["dataset_id"]);
      const collectionLinks = this.state.cmrResponse.map((g: any) => g["links"].slice(-1)[0]["href"]);
      const collectionInfo = collectionIDs.map((id: string, index: number) => [id, collectionLinks[index]]);
      submitOrder(
        granuleURs,
        collectionInfo,
      )
      .then(json => this.handleHermesResponse(json));
    }
  }

  private handleHermesResponse(hermesResponseJSON: object) {
    this.setState({"orderSubmissionResponse": hermesResponseJSON});
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
