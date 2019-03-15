import { List } from "immutable";
import * as React from "react";

import { CmrGranule } from "../types/CmrGranule";
import { OrderSubmissionParameters } from "../types/OrderSubmissionParameters";
import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { ConfirmationFlow } from "./ConfirmationFlow";
import { GranuleLimitWarning } from "./GranuleLimitWarning";
import { ScriptButton } from "./ScriptButton";
import { SubmitButton } from "./SubmitButton";

interface IOrderButtonsProps {
  cmrGranules?: List<CmrGranule>;
  cmrGranuleCount?: number;
  environment: IEnvironment;
  orderSubmissionParameters?: OrderSubmissionParameters;
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
                                                            "orderSubmissionParameters"]);
    const stateChanged = hasChanged(this.state, nextState, ["showConfirmationFlow"]);

    return propsChanged || stateChanged;
  }

  public render() {
    const loggedOut = !this.props.environment.user;
    const orderButtonsDisabled = !this.props.orderSubmissionParameters || loggedOut;

    return (
      <div>
      <GranuleLimitWarning show={true} />
      <div id="order-buttons">
        <ScriptButton
          disabled={orderButtonsDisabled}
          environment={this.props.environment}
          loggedOut={loggedOut}
          cmrGranules={this.props.cmrGranules} />
        <SubmitButton
          buttonText={"Order Files"}
          disabled={orderButtonsDisabled}
          hoverText={`Once processed, your Order page will contain links to one or more zip files,
          as well as to the individual file URLs.`}
          loggedOut={loggedOut}
          onSubmitOrder={this.handleSubmitOrder} />
        <ConfirmationFlow
          cmrGranuleCount={this.props.cmrGranuleCount}
          environment={this.props.environment}
          onRequestClose={this.closeConfirmationFlow}
          orderSubmissionParameters={this.props.orderSubmissionParameters}
          show={this.state.showConfirmationFlow} />
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
