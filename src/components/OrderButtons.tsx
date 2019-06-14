import * as React from "react";

import { OrderParameters } from "../types/OrderParameters";
import { OrderSubmissionParameters } from "../types/OrderSubmissionParameters";
import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { ConfirmationFlow } from "./ConfirmationFlow";
import { ScriptButton } from "./ScriptButton";
import { SubmitButton } from "./SubmitButton";

interface IOrderButtonsProps {
  cmrGranuleCount?: number;
  environment: IEnvironment;
  orderParameters: OrderParameters;
  orderSubmissionParameters?: OrderSubmissionParameters;
  totalSize: number;
}

interface IOrderButtonsState {
  showConfirmationFlow: boolean;
}

export class OrderButtons extends React.Component<IOrderButtonsProps, IOrderButtonsState> {
  public constructor(props: IOrderButtonsProps) {
    super(props);
    this.state = {
      showConfirmationFlow: false,
    };
  }

  public shouldComponentUpdate(nextProps: IOrderButtonsProps, nextState: IOrderButtonsState) {
    const propsChanged = hasChanged(this.props, nextProps, ["cmrGranuleCount",
                                                            "environment",
                                                            "orderParameters",
                                                            "orderSubmissionParameters",
                                                            "totalSize"]);
    const stateChanged = hasChanged(this.state, nextState, ["showConfirmationFlow"]);

    return propsChanged || stateChanged;
  }

  public render() {
    const loggedOut = !this.props.environment.user;
    const orderButtonDisabled = !this.props.orderSubmissionParameters || loggedOut;
    const scriptButtonDisabled = !this.props.orderSubmissionParameters;

    return (
      <div>
      <div id="order-buttons">
        <ScriptButton
          disabled={scriptButtonDisabled}
          environment={this.props.environment}
          orderParameters={this.props.orderParameters} />
        <SubmitButton
          buttonText={"Order Files"}
          disabled={orderButtonDisabled}
          hoverText={`Once processed, your Order page will contain links to one or more zip files,
          as well as to the individual file URLs.`}
          loggedOut={loggedOut}
          onSubmitOrder={this.handleSubmitOrder} />
        <ConfirmationFlow
          cmrGranuleCount={this.props.cmrGranuleCount}
          environment={this.props.environment}
          onRequestClose={this.closeConfirmationFlow}
          orderParameters={this.props.orderParameters}
          orderSubmissionParameters={this.props.orderSubmissionParameters}
          show={this.state.showConfirmationFlow}
          totalSize={this.props.totalSize} />
      </div>
      </div>
    );
  }

  public closeConfirmationFlow = () => {
    this.setState({showConfirmationFlow: false});
  }

  private handleSubmitOrder = () => {
    this.setState({
      showConfirmationFlow: true,
    });
  }
}
