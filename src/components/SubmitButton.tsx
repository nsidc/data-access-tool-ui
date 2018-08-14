import * as React from "react";

import * as callout from "../img/callout.png";
import { OrderSubmissionParameters } from "../types/OrderSubmissionParameters";
import { OrderTypes } from "../types/orderTypes";
import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";

interface ISubmitButtonProps {
  buttonText: string;
  disabled: boolean;
  environment: IEnvironment;
  hoverText: string;
  onSubmitOrder: any;
  orderSubmissionParameters?: OrderSubmissionParameters;
  orderType: OrderTypes;
}

interface ISubmitButtonState {
  orderSubmissionResponse?: {[index: string]: any};
}

export class SubmitButton extends React.Component<ISubmitButtonProps, ISubmitButtonState> {
  public constructor(props: ISubmitButtonProps) {
    super(props);
    this.state = {
      orderSubmissionResponse: undefined,
    };
    this.handleClick = this.handleClick.bind(this);
  }

  public shouldComponentUpdate(nextProps: ISubmitButtonProps) {
    return hasChanged(this.props, nextProps, ["buttonText", "disabled"]);
  }

  public render() {
    return (
      <div className="tooltip inline">
        <button
          className="submit-button eui-btn--green"
          disabled={this.props.disabled}
          onClick={this.handleClick}>
          {this.props.buttonText}
        </button>
        <span>
          <img className="img-no-border-left callout" src={callout} />
          {this.props.hoverText}
        </span>
      </div>
    );
  }

  public handleClick() {
    this.props.onSubmitOrder(this.props.orderType);
  }
}
