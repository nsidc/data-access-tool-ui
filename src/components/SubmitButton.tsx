import * as moment from "moment";
import * as React from "react";

import { OrderTypes } from "../types/orderTypes";
import { ISpatialSelection } from "../types/SpatialSelection";
import { granuleRequest } from "../utils/CMR";
import { submitOrder } from "../utils/Hermes";

interface ISubmitButtonProps {
  collectionId: string;
  spatialSelection: ISpatialSelection;
  temporalLowerBound: moment.Moment;
  temporalUpperBound: moment.Moment;
  onGranuleResponse: any;
  onSubmitOrderResponse: any;
  orderType: OrderTypes;
}

interface ISubmitButtonState {
  cmrResponse?: object[];
  orderSubmissionResponse?: {[index: string]: any};
}

export class SubmitButton extends React.Component<ISubmitButtonProps, ISubmitButtonState> {
  public constructor(props: ISubmitButtonProps) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleCmrResponse = this.handleCmrResponse.bind(this);

    this.state = {
      cmrResponse: undefined,
      orderSubmissionResponse: undefined,
    };
  }

  public render() {
    let buttonText: string;
    if (this.props.orderType === OrderTypes.listOfLinks) {
      buttonText = "Order List of Links";
    } else if (this.props.orderType === OrderTypes.zipFile) {
      buttonText = "Order Zip File";
    } else {
      throw new Error("Order type not recognized");
    }
    return (
      <button className="submit-button" onClick={this.handleClick}>{buttonText}</button>
    );
  }

  public componentDidUpdate(prevProps: ISubmitButtonProps, prevState: ISubmitButtonState) {
    if (this.state.cmrResponse && this.state.cmrResponse !== prevState.cmrResponse) {
      const granuleURs: string[] = this.state.cmrResponse.map((g: any) => g.title);
      const collectionIDs: string[] = this.state.cmrResponse.map((g: any) => g.dataset_id);
      const collectionLinks = this.state.cmrResponse.map((g: any) => g.links.slice(-1)[0].href);
      const collectionInfo = collectionIDs.map((id: string, index: number) => [id, collectionLinks[index]]);
      submitOrder(
        granuleURs,
        collectionInfo,
        this.props.orderType,
      )
      .then((json) => this.handleOrderSubmissionResponse(json))
      .catch((err) => console.log("Order submission failed: " + err));
    }
  }

  public handleClick() {
    if (this.props.collectionId
        && this.props.spatialSelection
        && this.props.temporalLowerBound
        && this.props.temporalUpperBound) {
      granuleRequest(
        this.props.collectionId,
        this.props.spatialSelection,
        this.props.temporalLowerBound,
        this.props.temporalUpperBound,
      ).then((json) => this.handleCmrResponse(json));
    } else {
      console.log("Insufficient props provided.");
    }
    return;
  }

  private handleOrderSubmissionResponse(orderSubmissionResponseJSON: object) {
    this.setState({orderSubmissionResponse: orderSubmissionResponseJSON});
    this.props.onSubmitOrderResponse(this.state.orderSubmissionResponse);
  }

  private handleCmrResponse(cmrResponseJSON: any) {
    this.setState({cmrResponse: cmrResponseJSON.feed.entry});
    this.props.onGranuleResponse(this.state.cmrResponse);
  }
}
