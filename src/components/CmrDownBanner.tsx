import * as React from "react";

interface ICmrDownBannerProps {
  cmrStatusChecked: boolean;
  cmrStatusOk: boolean;
}

export class CmrDownBanner extends React.Component<ICmrDownBannerProps, {}> {
  public constructor(props: ICmrDownBannerProps) {
    super(props);
  }

  public shouldComponentUpdate(nextProps: ICmrDownBannerProps) {
    const checkedChanged = nextProps.cmrStatusChecked !== this.props.cmrStatusChecked;
    const okChanged = nextProps.cmrStatusOk !== this.props.cmrStatusOk;

    return checkedChanged || okChanged;
  }

  public render() {
    if ((!this.props.cmrStatusChecked) || this.props.cmrStatusOk) {
      return null;
    }

    return (
      <span>CMR is down. Please try again in a few minutes.</span>
    );
  }
}
