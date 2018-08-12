import * as React from "react";
import * as ReactModal from "react-modal";

import { OrderSubmissionParameters } from "../types/OrderSubmissionParameters";
import { OrderTypes } from "../types/orderTypes";
import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { OrderConfirmationContent, OrderErrorContent, OrderSuccessContent } from "./ConfirmationContent";

interface IConfirmationFlowProps {
  environment: IEnvironment;
  onRequestClose: any;
  orderSubmissionParameters?: OrderSubmissionParameters;
  orderSubmitResponse?: any;
  orderType?: OrderTypes;
  show: boolean;
}

interface IConfirmationFlowState {
  visibleUI: any;
}

export class ConfirmationFlow extends React.Component<IConfirmationFlowProps, IConfirmationFlowState> {
  private orderConfirmationContent = (
    <OrderConfirmationContent onOK={this.handleConfirmationClick.bind(this)}
                              onCancel={this.props.onRequestClose.bind(this)} />
  );

  public constructor(props: IConfirmationFlowProps) {
    super(props);

    this.handleConfirmationClick = this.handleConfirmationClick.bind(this);
    this.handleOrderResponse = this.handleOrderResponse.bind(this);
    this.handleOrderError = this.handleOrderError.bind(this);
    this.resetUI = this.resetUI.bind(this);

    this.state = {
      visibleUI: this.orderConfirmationContent,
    };
  }

  public shouldComponentUpdate(nextProps: IConfirmationFlowProps, nextState: IConfirmationFlowState) {
    const propsChanged = hasChanged(this.props, nextProps, ["environment", "orderSubmitResponse", "show", "orderType"]);
    const stateChanged = hasChanged(this.state, nextState, ["visibleUI"]);
    return stateChanged || propsChanged;
  }

  public render() {
    return (
      <ReactModal className="modal-content"
                  isOpen={this.props.show}
                  onRequestClose={this.props.onRequestClose}>
        {this.state.visibleUI}
      </ReactModal>
    );
  }

  public handleConfirmationClick() {
    if (this.props.orderSubmissionParameters && this.props.orderType !== undefined) {
      this.props.environment.hermesAPI.submitOrder(
        this.props.environment.user,
        this.props.orderSubmissionParameters.granuleURs,
        this.props.orderSubmissionParameters.collectionInfo,
        this.props.orderType,
      )
      .then((json: any) => this.handleOrderResponse(json))
      .catch((err: any) => this.handleOrderError(err));
    }
  }

  private resetUI() {
    this.props.onRequestClose();
    this.setState({
      visibleUI: this.orderConfirmationContent,
    });
  }

  private handleOrderError(err: any) {
    console.log("Order submission failed: " + err);
    this.setState({
      visibleUI: <OrderErrorContent error={err}
                                    onOK={this.resetUI} />,
    });
  }

  private handleOrderResponse(json: any) {
    // TODO: Stop returning JSON and check the status code to decide which component to use
    // I think.
    this.setState({
      visibleUI: <OrderSuccessContent response={json}
                                      onOK={this.resetUI} />,
    });
  }
}
