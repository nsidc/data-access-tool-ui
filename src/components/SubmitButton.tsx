import * as React from "react";
import ReactTooltip from "react-tooltip";

import { hasChanged } from "../utils/hasChanged";

interface ISubmitButtonProps {
  buttonText: string;
  buttonId: string;
  tooltip: JSX.Element;
  disabled: boolean;
  onSubmitOrder: any;
}

export class SubmitButton extends React.Component<ISubmitButtonProps, {}> {
  public shouldComponentUpdate(nextProps: ISubmitButtonProps) {
    return hasChanged(this.props, nextProps, ["buttonText", "tooltip", "disabled"]);
  }

  public render() {
    return (
      <div className="tooltip" data-tip data-for={this.props.buttonId}>
        <ReactTooltip id={this.props.buttonId} className="reactTooltip"
          effect="solid" delayShow={500}>{this.props.tooltip}</ReactTooltip>
        <button
          type="button"
          className="submit-button eui-btn--blue"
          disabled={this.props.disabled}
          onClick={this.handleClick}>
          {this.props.buttonText}
        </button>
      </div>
    );
  }

  public handleClick = () => {
    this.props.onSubmitOrder();
  }
}
