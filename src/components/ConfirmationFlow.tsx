import * as React from "react";
import * as ReactModal from "react-modal";

import { OrderSubmissionParameters } from "../types/OrderSubmissionParameters";
import { OrderTypes } from "../types/orderTypes";
import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { OrderConfirmationContent, OrderErrorContent, OrderSuccessContent } from "./ConfirmationContent";
import { LoadingIcon } from "./LoadingIcon";

interface IConfirmationFlowProps {
  environment: IEnvironment;
  onRequestClose: () => void;
  orderSubmissionParameters?: OrderSubmissionParameters;
  orderType?: OrderTypes;
  show: boolean;
}

interface IConfirmationFlowState {
  visibleUI: JSX.Element;
}

export class ConfirmationFlow extends React.Component<IConfirmationFlowProps, IConfirmationFlowState> {
  private orderConfirmationContent = (
    <OrderConfirmationContent onOK={() => { this.handleConfirmationClick(); }}
                              onCancel={this.props.onRequestClose}
                              environment={this.props.environment} />
  );

  public constructor(props: IConfirmationFlowProps) {
    super(props);

    this.state = {
      visibleUI: this.orderConfirmationContent,
    };
  }

  public shouldComponentUpdate(nextProps: IConfirmationFlowProps, nextState: IConfirmationFlowState) {
    const propsChanged = hasChanged(this.props, nextProps, ["environment", "show", "orderType"]);
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

  public handleConfirmationClick = () => {
    if (this.props.orderSubmissionParameters && this.props.orderType !== undefined) {
      this.showLoadingIcon();
      this.props.environment.hermesAPI.submitOrder(
        this.props.environment.user,
        this.props.orderSubmissionParameters.granuleURs,
        this.props.orderSubmissionParameters.collectionInfo,
        this.props.orderType,
      )
      .then((response: any) => {
        if (![200, 201].includes(response.status)) {
          throw new Error(`${response.status} received from order system: "${response.statusText}"`);
        }
        return response.json();
      })
      .then((json: any) => this.handleOrderResponse(json))
      .catch((err: any) => this.handleOrderError(err));
    }
  }

  private showLoadingIcon() {
    this.setState({visibleUI: <LoadingIcon />});
  }

  private resetUI = () => {
    this.props.onRequestClose();
    this.setState({
      visibleUI: this.orderConfirmationContent,
    });
  }

  private handleOrderError = (err: any) => {
    this.setState({
      visibleUI: <OrderErrorContent error={err}
                                    onOK={this.resetUI} />,
    });
  }

  private handleOrderResponse = (json: any) => {
    this.setState({
      visibleUI: <OrderSuccessContent response={json}
                                      onOK={this.resetUI}
                                      environment={this.props.environment} />,
    });
  }
}
