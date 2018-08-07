import * as React from "react";

import { hasChanged } from "../utils/hasChanged";

interface ICmrDownBannerProps {
  cmrStatusChecked: boolean;
  cmrStatusOk: boolean;
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
      <span>
        We're sorry, but due to the unavailability of an external resource, we
        cannot process your request at this time. Please try again in a few
        minutes.
      </span>
    );
  }
}
