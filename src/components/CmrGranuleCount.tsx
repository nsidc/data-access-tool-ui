import * as React from "react";

import { OrderParameters } from "../types/OrderParameters";
import { cmrGranuleCountRequest } from "../utils/CMR";
import { hasChanged } from "../utils/hasChanged";
import { LoadingIcon } from "./LoadingIcon";

interface ICmrGranuleCountProps {
  orderParameters: OrderParameters;
}

interface ICmrGranuleCountState {
  granuleCount?: number;
  loading: boolean;
}

export class CmrGranuleCount extends React.Component<ICmrGranuleCountProps, ICmrGranuleCountState> {
  public constructor(props: ICmrGranuleCountProps) {
    super(props);

    this.state = {
      granuleCount: undefined,
      loading: true,
    };
  }

  public shouldComponentUpdate(nextProps: ICmrGranuleCountProps, nextState: ICmrGranuleCountState) {
    const propsChanged = hasChanged(this.props, nextProps, ["orderParameters"]);
    const stateChanged = hasChanged(this.state, nextState, ["granuleCount", "loading"]);

    return propsChanged || stateChanged;
  }

  public componentDidUpdate(prevProps: ICmrGranuleCountProps) {
    if (hasChanged(prevProps, this.props, ["orderParameters"])) {
      this.setState({loading: true}, this.handleGranuleCountRequest);
    }
  }

  public render() {
    return (
      <span id="granule-count-container">
        {this.renderContent()}
      </span>
    );
  }

  private renderContent = () => {
    if (this.state.loading || this.state.granuleCount === undefined) {
      return (<LoadingIcon size="sm" className="loading-spinner-inline" />);
    }

    return (
      <span>{this.state.granuleCount.toLocaleString()}</span>
    );
  }

  private handleGranuleCountRequest = () => {
    cmrGranuleCountRequest(this.props.orderParameters.collection.short_name,
                           Number(this.props.orderParameters.collection.version_id),
                           this.props.orderParameters.spatialSelection,
                           this.props.orderParameters.collectionSpatialCoverage,
                           this.props.orderParameters.temporalFilterLowerBound,
                           this.props.orderParameters.temporalFilterUpperBound)
    .then((json: any) => this.setState({
      granuleCount: json.feed.entry[0].granule_count,
      loading: false,
    }))
    .finally(() => this.setState({loading: false}));
  }
}
