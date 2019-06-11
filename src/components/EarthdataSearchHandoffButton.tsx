import * as React from "react";
import * as ReactTooltip from "react-tooltip";

import { OrderParameters } from "../types/OrderParameters";
import { hasChanged } from "../utils/hasChanged";

interface IHandoffButtonProps {
  orderParameters: OrderParameters;
}

export class EarthdataSearchHandoffButton extends React.Component<IHandoffButtonProps> {
  public constructor(props: IHandoffButtonProps) {
    super(props);

    this.state = {
      loading: false,
    };
  }

  public shouldComponentUpdate(nextProps: IHandoffButtonProps) {
    const propsChanged = hasChanged(this.props, nextProps, ["orderParameters"]);

    return propsChanged;
  }

  public render() {
    return (
      <span>
        {this.renderScriptButton()}
      </span>
    );
  }

  private renderScriptButton = () => {
    const tooltip = <div><span>Is the grass greener on the other side?</span></div>;

    return (
      <div className="tooltip" data-tip data-for="handoffbutton">
        <ReactTooltip id="handoffbutton" className="reactTooltip"
          effect="solid" delayShow={500}>{tooltip}</ReactTooltip>
        <button
          type="button"
          className="handoff-button eui-btn--blue"
          onClick={() => this.earthdataRedirect(this.props.orderParameters)}>
          Brave Sir Robin ran away, away!
        </button>
      </div>
    );
  }

  private earthdataRedirect = (orderParameters: OrderParameters) => {
    debugger;
    // Fetch collection unique identifier from CMR by shortname/version

    // Add asterisks to the filter, if there is a filter

    // Spatial filter: urlencode

    // Temporalfilter: urlencode

    // Build URL:
    // https://search.earthdata.nasa.gov/search?p={collection_unique_id}
    // &polygon={polygon}
    // &pg[0][id]={textfilter}
    // &pg[0][qt]={temporal_start},{temporal_end}

    // Redirect user
    return;
  }
}
