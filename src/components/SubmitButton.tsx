import * as React from "react";

import * as callout from "../img/callout.png";
import { OrderTypes } from "../types/orderTypes";
import { hasChanged } from "../utils/hasChanged";

interface ISubmitButtonProps {
  buttonText: string;
  disabled: boolean;
  onSubmitOrder: any;
  hoverText: string;
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
