import { List } from "immutable";
import * as React from "react";

import { CmrGranule } from "../types/CmrGranule";
import { OrderSubmissionParameters } from "../types/OrderSubmissionParameters";
import { OrderTypes } from "../types/orderTypes";
import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { ConfirmationFlow } from "./ConfirmationFlow";
import { ScriptButton } from "./ScriptButton";
import { SubmitButton } from "./SubmitButton";

interface IOrderButtonsProps {
  cmrResponse?: List<CmrGranule>;
  environment: IEnvironment;
  orderSubmissionParameters?: OrderSubmissionParameters;
}

interface IOrderButtonsState {
  orderSubmitResponse: any;
  orderType?: OrderTypes;
  showConfirmationFlow: boolean;
}

export class OrderButtons extends React.Component<IOrderButtonsProps, IOrderButtonsState> {
  public constructor(props: IOrderButtonsProps) {
    super(props);
    this.state = {
      orderSubmitResponse: undefined,
      orderType: undefined, // Don't forget to set it back after submitting order
      showConfirmationFlow: false,
    };
  }

  public shouldComponentUpdate(nextProps: IOrderButtonsProps, nextState: IOrderButtonsState) {
    const propsChanged = hasChanged(this.props, nextProps, ["environment", "orderSubmissionParameters"]);
    const stateChanged = hasChanged(this.state, nextState, ["orderSubmitResponse", "showConfirmationFlow"]);

    return propsChanged || stateChanged;
  }

  public render() {
    return (
      <div id="order-buttons">
        <SubmitButton
          environment={this.props.environment}
          orderSubmissionParameters={this.props.orderSubmissionParameters}
          onSubmitOrder={this.handleSubmitOrder}
          orderType={OrderTypes.listOfLinks} />
        <SubmitButton
          environment={this.props.environment}
          orderSubmissionParameters={this.props.orderSubmissionParameters}
          onSubmitOrder={this.handleSubmitOrder}
          orderType={OrderTypes.zipFile} />
        <ScriptButton
          environment={this.props.environment}
          cmrResponse={this.props.cmrResponse}
          orderSubmissionParameters={this.props.orderSubmissionParameters} />
        <ConfirmationFlow
          environment={this.props.environment}
          onRequestClose={this.closeConfirmationFlow}
          orderSubmissionParameters={this.props.orderSubmissionParameters}
          orderSubmitResponse={this.state.orderSubmitResponse}
          orderType={this.state.orderType}
          show={this.state.showConfirmationFlow} />
      </div>
    );
  }

  public closeConfirmationFlow = () => {
    this.setState({showConfirmationFlow: false});
  }

  private handleSubmitOrder = (orderType: OrderTypes) => {
    this.setState({
      orderType,
      showConfirmationFlow: true,
    });
  }
}
