import * as moment from "moment";
import * as React from "react";

import * as ReactModal from "react-modal";

import { granuleRequest } from "../CMR";
import { submitOrder } from "../Hermes";
import { ISpatialSelection } from "../SpatialSelection";
import { ViewOrder } from "./ViewOrder";

ReactModal.setAppElement("#everest-ui");

interface ISubmitButtonProps {
  collectionId: string;
  spatialSelection: ISpatialSelection;
  temporalLowerBound: moment.Moment;
  temporalUpperBound: moment.Moment;
  onGranuleResponse: any;
}

interface ISubmitButtonState {
  orderStatus: any;
  cmrResponse?: object[];
  orderSubmissionResponse?: {[index: string]: any};
  orderDetailsDisplayed: boolean;
}

export class SubmitBtn extends React.Component<ISubmitButtonProps, ISubmitButtonState> {
  public constructor(props: any) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleCmrResponse = this.handleCmrResponse.bind(this);
    this.handleOpenOrderDetailModal = this.handleOpenOrderDetailModal.bind(this);
    this.handleCloseOrderDetailModal = this.handleCloseOrderDetailModal.bind(this);

    this.state = {
      cmrResponse: undefined,
      orderDetailsDisplayed: false,
      orderStatus: "Submit an order, buddy!",
      orderSubmissionResponse: undefined,
    };
  }

  public render() {
    let submittedOrderDetails: any = (<span>{this.state.orderStatus}</span>);
    if (this.state.orderSubmissionResponse) {
      const orderState: any = this.state.orderSubmissionResponse.message;
      submittedOrderDetails = (
        <span>
          <button
            className="view-order-button"
            onClick={this.handleOpenOrderDetailModal}>
            View Details ({orderState.order_id})
          </button>
          <ReactModal
            isOpen={this.state.orderDetailsDisplayed}
            onRequestClose={this.handleCloseOrderDetailModal}>
            <button onClick={this.handleCloseOrderDetailModal}>x</button>
            <ViewOrder
              orderId={orderState.order_id}
              destination={orderState.destination}
              status={orderState.status} />
          </ReactModal>
        </span>
      );
    }
    return (
      <div>
        <button className="submit-button" onClick={this.handleClick}>Search</button>
        {submittedOrderDetails}
      </div>
    );
  }

  public componentDidUpdate(prevProps: ISubmitButtonProps, prevState: ISubmitButtonState) {
    if (this.state.cmrResponse && this.state.cmrResponse !== prevState.cmrResponse) {
      const granuleURs: string[] = this.state.cmrResponse.map((g: any) => g.title);
      const collectionIDs: string[] = this.state.cmrResponse.map((g: any) => g.dataset_id);
      const collectionLinks = this.state.cmrResponse.map((g: any) => g.links.slice(-1)[0].href);
      const collectionInfo = collectionIDs.map((id: string, index: number) => [id, collectionLinks[index]]);
      this.setState({orderStatus: "Order submitted, please wait..."});
      submitOrder(
        granuleURs,
        collectionInfo,
      )
      .then((json) => this.handleHermesResponse(json))
      .catch((err) => this.setState({orderStatus: "Order failed: " + err}));
    }
  }

  private handleHermesResponse(hermesResponseJSON: object) {
    this.setState({orderSubmissionResponse: hermesResponseJSON});
  }

  private handleCmrResponse(cmrResponseJSON: any) {
    this.setState({cmrResponse: cmrResponseJSON.feed.entry});
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
        this.props.temporalUpperBound,
      ).then((json) => this.handleCmrResponse(json));
    } else {
      console.log("Insufficient props provided.");
    }
    return;
  }
  private handleOpenOrderDetailModal() {
    this.setState({orderDetailsDisplayed: true});
  }
  private handleCloseOrderDetailModal() {
    this.setState({orderDetailsDisplayed: false});
  }
}
