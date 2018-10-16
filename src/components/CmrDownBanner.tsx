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

    return (
      <div>
        <div id="cmr-status">
          <div id="banner-close" onClick={(e: any) => this.props.onChange()}>
            <FontAwesomeIcon
              icon={faTimesCircle}
              size="2x" />
          </div>
          {this.props.cmrStatusMessage}
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
