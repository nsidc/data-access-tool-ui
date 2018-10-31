import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";

import { hasChanged } from "../utils/hasChanged";

interface ICmrDownBannerProps {
  cmrStatusChecked: boolean;
  cmrStatusMessage: string;
  cmrStatusOk: boolean;
  onChange: any;
}

export class CmrDownBanner extends React.Component<ICmrDownBannerProps, {}> {
  public shouldComponentUpdate(nextProps: ICmrDownBannerProps) {
    return hasChanged(this.props, nextProps, ["cmrStatusChecked", "cmrStatusOk"]);
  }

  public render() {
    if ((!this.props.cmrStatusChecked) || this.props.cmrStatusOk) {
      return null;
    }

    const style = (this.props.cmrStatusMessage === "") ? {} : {display: "none"};

    // That &#0020; is necessary to ensure that there is a space after the 'mailto' link.
    return (
      <div>
        <div id="cmr-status">
          <div id="cmr-status-close" onClick={(e: any) => this.props.onChange()}>
            <FontAwesomeIcon
              icon={faTimesCircle}
              size="2x" />
          </div>
          <div id="cmr-status-msg">
            {this.props.cmrStatusMessage}
            <div style={style}>
              We're sorry, but an error has occurred that is blocking this process.
              Please contact User Services at <a href="mailto:nsidc.org">nsidc@nsidc.org</a>&#0020;
              for further information and assistance.
              User Services operates Monday to Friday, from 9:00 a.m. to 5 p.m. (MT).
            </div>
          </div>
        </div>
        <div id="cmr-status-blocked" onClick={this.handleClick}>
        </div>
      </div>
    );
  }

  private handleClick = (e: any) => {
    e.preventDefault();
  }
}
