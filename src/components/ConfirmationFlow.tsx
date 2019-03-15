import * as React from "react";
import * as ReactModal from "react-modal";

import { OrderSubmissionParameters } from "../types/OrderSubmissionParameters";
import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { OrderConfirmationContent, OrderErrorContent, OrderSuccessContent } from "./ConfirmationContent";
import { LoadingIcon } from "./LoadingIcon";

interface IConfirmationFlowProps {
  cmrGranuleCount?: number;
  environment: IEnvironment;
  onRequestClose: () => void;
  orderSubmissionParameters?: OrderSubmissionParameters;
  show: boolean;
}

interface IConfirmationFlowState {
  visibleUI: JSX.Element | null;
}

export class ConfirmationFlow extends React.Component<IConfirmationFlowProps, IConfirmationFlowState> {
  public constructor(props: IConfirmationFlowProps) {
    super(props);

    this.state = {
      visibleUI: null,
    };
  }

  public shouldComponentUpdate(nextProps: IConfirmationFlowProps, nextState: IConfirmationFlowState) {
    const propsChanged = hasChanged(this.props, nextProps, ["cmrGranuleCount", "environment", "show"]);
    const stateChanged = hasChanged(this.state, nextState, ["visibleUI"]);
    return stateChanged || propsChanged;
  }

  public render() {
    return (
      <ReactModal className="modal-content"
                  isOpen={this.props.show}
                  onRequestClose={this.props.onRequestClose}
                  parentSelector={() => document.getElementById("everest-ui") || document.body}>
        {this.state.visibleUI || this.orderConfirmationContent()}
      </ReactModal>
    );
  }

  public handleConfirmationClick = () => {
    if (this.props.orderSubmissionParameters) {
      this.showLoadingIcon();
      return this.submitOrder();
    }
    return;
  }

  private orderConfirmationContent = () => {
    return (
      <OrderConfirmationContent onOK={this.handleConfirmationClick}
                                onCancel={this.props.onRequestClose}
                                cmrGranuleCount={this.props.cmrGranuleCount}
                                environment={this.props.environment} />
    );
  }

  private submitOrder = () => {
    return this.props.environment.hermesAPI.submitOrder(
      this.props.environment.user,
      this.props.orderSubmissionParameters!.selectionCriteria,
    )
    .then((response: any) => {
      if (![200, 201].includes(response.status)) {
        throw new Error(`${response.status} received from order system: "${response.statusText}"`);
      }
      const json = response.json();
      return json;
    })
    .then((json: any) => {
      this.handleOrderResponse(json);
    })
    .catch((err: any) => {
      this.handleOrderError(err);
    });
  }

  private showLoadingIcon() {
    this.setState({visibleUI: <LoadingIcon size="5x" />});
  }

  private resetUI = () => {
    this.props.onRequestClose();
    this.setState({
      visibleUI: null,
    });
  }

  private handleOrderError(err: any) {
    this.setState({
      visibleUI: <OrderErrorContent error={err}
                                    onOK={this.resetUI} />,
    });
  }

  private handleOrderResponse(json: any) {
    this.setState({
      visibleUI: <OrderSuccessContent response={json}
                                      onOK={this.resetUI}
                                      environment={this.props.environment} />,
    });
  }
}
