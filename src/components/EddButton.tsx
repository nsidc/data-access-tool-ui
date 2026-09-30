import * as React from "react";
import { Tooltip } from "react-tooltip";

import { hasChanged } from "../utils/hasChanged";

import "../styles/eui_buttons.less";

interface IEddButtonProps {
  disabled: boolean;
  buttonText: string;
  buttonId: string;
  tooltip: JSX.Element;
  onEddOrder: any;
}

export class EddButton extends React.Component<IEddButtonProps, {}> {
  public shouldComponentUpdate(nextProps: IEddButtonProps) {
    return hasChanged(this.props, nextProps, ["buttonText", "tooltip", "disabled"]);
  }

  public render() {
    return (
      <div className="tooltip" data-tooltip-id={this.props.buttonId}>
        <Tooltip id={this.props.buttonId} className="reactTooltip"
          delayShow={500}>{this.props.tooltip}</Tooltip>
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
    this.props.onEddOrder();
  }
}
