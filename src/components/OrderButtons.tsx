import { fromJS, Map } from "immutable";
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

  public shouldComponentUpdate(nextProps: IOrderButtonsProps, nextState: IOrderButtonsState) {
    const compareMap = (props: IOrderButtonsProps,
                        state: IOrderButtonsState) => Map({
                          environment: fromJS(props.environment),
                          orderSubmissionParameters: props.orderSubmissionParameters,
                          orderSubmitResponse: fromJS(state.orderSubmitResponse),
                        });

    return !compareMap(this.props, this.state).equals(compareMap(nextProps, nextState));
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
