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
  cmrGranules?: List<CmrGranule>;
  ensureGranuleScrollDepleted: (callback?: () => any) => void;
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
    const loggedOut = !this.props.environment.user;
    const orderButtonsDisabled = !this.props.orderSubmissionParameters || loggedOut;

    return (
      <div>
      <div id="order-limit-message">
      IMPORTANT: During the beta test period, orders are limited to 10,000
      granules regardless of the number you request.
      </div>
      <div id="order-buttons">
        <ScriptButton
          disabled={orderButtonsDisabled}
          ensureGranuleScrollDepleted={this.props.ensureGranuleScrollDepleted}
          environment={this.props.environment}
          loggedOut={loggedOut}
          cmrGranules={this.props.cmrGranules} />
        <SubmitButton
          buttonText={"Get Individual Files"}
          disabled={orderButtonsDisabled}
          hoverText={"Once processed, your Order page will have a linked list of files."}
          loggedOut={loggedOut}
          onSubmitOrder={this.handleSubmitOrder}
          orderType={OrderTypes.listOfLinks} />
        <SubmitButton
          buttonText={"Order Zip File"}
          disabled={orderButtonsDisabled}
          hoverText={"Once processed, your Order page will link to one or more zipped files."}
          loggedOut={loggedOut}
          onSubmitOrder={this.handleSubmitOrder}
          orderType={OrderTypes.zipFile} />
        <ConfirmationFlow
          ensureGranuleScrollDepleted={this.props.ensureGranuleScrollDepleted}
          environment={this.props.environment}
          onRequestClose={this.closeConfirmationFlow}
          orderSubmissionParameters={this.props.orderSubmissionParameters}
          orderType={this.state.orderType}
          show={this.state.showConfirmationFlow} />
      </div>
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
