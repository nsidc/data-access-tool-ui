import * as React from "react";
import * as ReactTooltip from "react-tooltip";

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
    const tooltipSpan = <span>{this.props.hoverText}</span>;
    const loggedOutSpan = (this.props.loggedOut) ? (
      <span>
        <br />
        <span className="must-be-logged-in">You must be logged in.</span>
      </span>
    ) : null;
    const tooltip = <div>{tooltipSpan}{loggedOutSpan}</div>;

    return (
      <div className="tooltip" data-tip data-for={this.props.buttonText}>
        <ReactTooltip id={this.props.buttonText} className="reactTooltip"
          effect="solid" delayShow={500}>{tooltip}</ReactTooltip>
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
