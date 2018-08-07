import { List } from "immutable";
import * as React from "react";

import { CmrGranule } from "../types/CmrGranule";
import { OrderSubmissionParameters } from "../types/OrderSubmissionParameters";
import { OrderTypes } from "../types/orderTypes";
import { IEnvironment } from "../utils/environment";
import { genericShouldUpdate } from "../utils/shouldUpdate";
import { ScriptButton } from "./ScriptButton";
import { SubmitButton } from "./SubmitButton";
import { ViewOrderPrompt } from "./ViewOrderPrompt";

interface IOrderButtonsProps {
  cmrResponse?: List<CmrGranule>;
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
    return genericShouldUpdate({
      currentProps: this.props,
      currentState: this.state,
      nextProps,
      nextState,
      propsToCheck: ["environment", "orderSubmissionParameters"],
      stateToCheck: ["orderSubmitResponse"],
    });
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
        <ScriptButton
          environment={this.props.environment}
          cmrResponse={this.props.cmrResponse}
          orderSubmissionParameters={this.props.orderSubmissionParameters} />
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
