import * as React from "react";
import * as ReactModal from "react-modal";
import ReactTooltip from "react-tooltip";

import { OrderParameters } from "../types/OrderParameters";
import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { LoadingIcon } from "./LoadingIcon";

import "../styles/eui_buttons.less";

interface IScriptButtonProps {
  disabled: boolean;
  environment: IEnvironment;
  onClick: () => void;
  orderParameters: OrderParameters;
}

interface IScriptButtonState {
  loading: boolean;
}

export class ScriptButton extends React.Component<IScriptButtonProps, IScriptButtonState> {
  public constructor(props: IScriptButtonProps) {
    super(props);

    this.state = {
      loading: false,
    };
  }

  public shouldComponentUpdate(nextProps: IScriptButtonProps, nextState: IScriptButtonState) {
    const propsChanged = hasChanged(this.props, nextProps, ["orderParameters", "disabled"]);
    const stateChanged = hasChanged(this.state, nextState, ["loading"]);

    return propsChanged || stateChanged;
  }

  public render() {
    return (
      <span>
        {this.renderScriptButton()}
        {this.renderLoadingIcon()}
      </span>
    );
  }

  private renderScriptButton = () => {
    const tooltip = <div><span>Download Python script.</span></div>;

    return (
      <div className="tooltip" data-tip data-for="scriptbutton">
        <ReactTooltip id="scriptbutton" className="reactTooltip"
          effect="solid" delayShow={500}>{tooltip}</ReactTooltip>
        <button
          type="button"
          className="script-button eui-btn--blue"
          disabled={this.props.disabled}
          onClick={this.props.onClick}>
          Download Script
        </button>
      </div>
    );
  }

  private renderLoadingIcon = () => {
    return (
      <ReactModal className="modal-content"
        isOpen={this.state.loading}
        parentSelector={() => document.getElementById("everest-ui") || document.body}>
        <LoadingIcon size="5x" />
      </ReactModal>
    );
  }
}
