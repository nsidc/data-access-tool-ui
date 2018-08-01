import * as React from "react";

import { OrderSubmissionParameters } from "../types/OrderSubmissionParameters";
import { OrderTypes } from "../types/orderTypes";
import { IEnvironment } from "../utils/environment";
import { SubmitButton } from "./SubmitButton";
import { ViewOrderPrompt } from "./ViewOrderPrompt";

interface IOrderButtonsProps {
  environment: IEnvironment;
  orderSubmissionParameters?: OrderSubmissionParameters;
}

interface IOrderButtonsState {
  orderSubmitResponse: any;
}

export class OrderButtons extends React.Component<IOrderButtonsProps, IOrderButtonsState> {
  public constructor(props: IOrderButtonsProps) {
    super(props);
    this.handleSubmitOrderResponse = this.handleSubmitOrderResponse.bind(this);
    this.state = {
      orderSubmitResponse: undefined,
    };
  }

  public render() {
    return (
      <div id="order-buttons">
        <SubmitButton
          environment={this.props.environment}
          orderSubmissionParameters={this.props.orderSubmissionParameters}
          onSubmitOrderResponse={this.handleSubmitOrderResponse}
          orderType={OrderTypes.listOfLinks} />
        <SubmitButton
          environment={this.props.environment}
          orderSubmissionParameters={this.props.orderSubmissionParameters}
          onSubmitOrderResponse={this.handleSubmitOrderResponse}
          orderType={OrderTypes.zipFile} />
        <ViewOrderPrompt
          environment={this.props.environment}
          orderSubmitResponse={this.state.orderSubmitResponse} />
      </div>
    );
  }

  private handleSubmitOrderResponse(hermesResponse: any) {
    this.setState({orderSubmitResponse: hermesResponse});
  }
}
