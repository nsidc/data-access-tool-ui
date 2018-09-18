import * as React from "react";

import * as callout from "../img/callout.png";
import { OrderTypes } from "../types/orderTypes";
import { hasChanged } from "../utils/hasChanged";

interface ISubmitButtonProps {
  buttonText: string;
  disabled: boolean;
  hoverText: string;
  loggedOut: boolean;
  onSubmitOrder: any;
  orderType: OrderTypes;
}

export class SubmitButton extends React.Component<ISubmitButtonProps, {}> {
  public constructor(props: ISubmitButtonProps) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  public shouldComponentUpdate(nextProps: ISubmitButtonProps) {
    return hasChanged(this.props, nextProps, ["buttonText", "disabled"]);
  }

  public render() {
    const loggedOutSpan = this.props.loggedOut ? (
      <span>
        <br/>
        <span className="must-be-logged-in">You must be logged in.</span>
      </span>
    ) : null;

    return (
      <div className="tooltip">
        <span className="hover-text">
          {this.props.hoverText}
          {loggedOutSpan}
          <img className="img-no-border-left callout" src={callout} />
        </span>
        <button
          className="submit-button eui-btn--blue"
          disabled={this.props.disabled}
          onClick={this.handleClick}>
          {this.props.buttonText}
        </button>
      </div>
    );
  }

  public handleClick() {
    this.props.onSubmitOrder(this.props.orderType);
  }
}
