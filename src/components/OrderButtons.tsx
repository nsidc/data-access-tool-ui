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
  orderType?: OrderTypes;
  showConfirmationFlow: boolean;
}

export class OrderButtons extends React.Component<IOrderButtonsProps, IOrderButtonsState> {
  public constructor(props: IOrderButtonsProps) {
    super(props);
    this.state = {
      orderType: undefined, // Don't forget to set it back after submitting order
      showConfirmationFlow: false,
    };
  }

  public shouldComponentUpdate(nextProps: IOrderButtonsProps, nextState: IOrderButtonsState) {
    const propsChanged = hasChanged(this.props, nextProps, ["environment", "orderSubmissionParameters"]);
    const stateChanged = hasChanged(this.state, nextState, ["showConfirmationFlow"]);

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
          hoverText={"Once processed, your Order page will have a linked list of files."}
          onSubmitOrder={this.handleSubmitOrder}
          orderType={OrderTypes.listOfLinks} />
        <SubmitButton
          buttonText={"Order Zip File"}
          disabled={orderButtonsDisabled}
          hoverText={"Once processed, your Order page will link to one or more zipped files."}
          onSubmitOrder={this.handleSubmitOrder}
          orderType={OrderTypes.zipFile} />
        <ConfirmationFlow
          environment={this.props.environment}
          onRequestClose={this.closeConfirmationFlow}
          orderSubmissionParameters={this.props.orderSubmissionParameters}
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
