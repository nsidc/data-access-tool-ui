import { List } from "immutable";
import * as React from "react";

import { CmrGranule } from "../types/CmrGranule";
import { OrderSubmissionParameters } from "../types/OrderSubmissionParameters";
import { OrderTypes } from "../types/orderTypes";
import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
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
    const propsChanged = hasChanged(this.props, nextProps, ["environment", "orderSubmissionParameters"]);
    const stateChanged = hasChanged(this.state, nextState, ["orderSubmitResponse"]);

    return propsChanged || stateChanged;
  }

  public render() {
    const orderButtonsDisabled = !this.props.orderSubmissionParameters || !this.props.environment.user;

    return (
      <div id="order-buttons">
        <ScriptButton
          disabled={orderButtonsDisabled}
          environment={this.props.environment}
          cmrResponse={this.props.cmrResponse} />
        <SubmitButton
          buttonText={"Get Individual Files"}
          disabled={orderButtonsDisabled}
          environment={this.props.environment}
          hoverText={"Once the order is processed, go to the Order page for a list of links to your files."}
          orderSubmissionParameters={this.props.orderSubmissionParameters}
          onSubmitOrderResponse={this.handleSubmitOrderResponse}
          orderType={OrderTypes.listOfLinks} />
        <SubmitButton
          buttonText={"Order Zip File"}
          disabled={orderButtonsDisabled}
          environment={this.props.environment}
          hoverText={"Once the order is processed, go to the Order page for a list of links to your files."}
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
