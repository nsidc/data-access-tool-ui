import * as React from "react";
import * as ReactTooltip from "react-tooltip";

import { hasChanged } from "../utils/hasChanged";

interface ISubmitButtonProps {
  buttonText: string;
  cmrGranuleCount?: number;
  disabled: boolean;
  loggedOut: boolean;
  onSubmitOrder: any;
}

export class SubmitButton extends React.Component<ISubmitButtonProps, {}> {
  public constructor(props: ISubmitButtonProps) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  public shouldComponentUpdate(nextProps: ISubmitButtonProps) {
    return hasChanged(this.props, nextProps, ["buttonText", "cmrGranuleCount", "disabled"]);
  }

  public render() {
    const loggedOutSpan = (this.props.loggedOut) ? (
      <span className="must-be-logged-in">
        You must be logged in to place an order.
      </span>
    ) : null;
    const tooltip = (this.props.cmrGranuleCount && this.props.cmrGranuleCount > 2000) ? (
      <div>
        <div>
          Orders for >2000 files will be rerouted to Earthdata Search for
          fulfillment. The order will contain exactly the files you specified
          here. {loggedOutSpan}
        </div>
        <div>
          Alternatively, you can <span style={{color: "blue"}}>download a Python
          script</span>, which has no file limits, to retrieve your files.
        </div>
      </div>
    ) : (
      <div>
        <div>Once processed, your Order page will contain links to one or more
        zip files, as well as to the individual file URLs.</div>
        <div>{loggedOutSpan}</div>
      </div>
    );

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
    this.props.onSubmitOrder();
  }
}
