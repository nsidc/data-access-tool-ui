import * as React from "react";

import { IOrderSubmissionParameters } from "../types/OrderParameters";
import { OrderTypes } from "../types/orderTypes";
import { SubmitButton } from "./SubmitButton";
import { ViewOrderPrompt } from "./ViewOrderPrompt";

interface IOrderButtonsProps {
  orderSubmissionParameters?: IOrderSubmissionParameters;
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
          orderSubmissionParameters={this.props.orderSubmissionParameters}
          onSubmitOrderResponse={this.handleSubmitOrderResponse}
          orderType={OrderTypes.listOfLinks} />
        <SubmitButton
          orderSubmissionParameters={this.props.orderSubmissionParameters}
          onSubmitOrderResponse={this.handleSubmitOrderResponse}
          orderType={OrderTypes.zipFile} />
        <ViewOrderPrompt
          orderSubmitResponse={this.state.orderSubmitResponse} />
      </div>
    );
  }

  private handleSubmitOrderResponse(hermesResponse: any) {
    this.setState({orderSubmitResponse: hermesResponse});
  }
}
