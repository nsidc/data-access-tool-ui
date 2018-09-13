import * as React from "react";

import { LoadingIcon } from "./LoadingIcon";

interface ICmrGranuleCountProps {
  count?: number;
  loading: boolean;
}

export class CmrGranuleCount extends React.Component<ICmrGranuleCountProps, {}> {
  public constructor(props: ICmrGranuleCountProps) {
    super(props);
  }

  public render() {
    return (
      <span id="granule-count-container">
        {this.renderContent()}
      </span>
    );
  }

  private renderContent = () => {
    if (this.props.loading || this.props.count === undefined) {
      return (<LoadingIcon size="sm" className="loading-spinner-inline" />);
    }

    return (
      <span>{this.props.count.toLocaleString()}</span>
    );
  }
}
