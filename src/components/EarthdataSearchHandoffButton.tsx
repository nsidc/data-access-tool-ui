import * as React from "react";
import * as ReactTooltip from "react-tooltip";

import { CmrCollection } from "../types/CmrCollection";
import { OrderParameters } from "../types/OrderParameters";
import { filterAddWildcards } from "../utils/CMR";
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
          onClick={() => this.edscRedirect(this.props.orderParameters)}>
          Brave Sir Robin ran away, away!
        </button>
      </div>
    );
  }

  private edscRedirect = (orderParameters: OrderParameters) => {
    const conceptId = orderParameters.collection.id;
    const textFilter = orderParameters.cmrGranuleFilter;
    const spatialSelection = orderParameters.spatialSelection;
    const temporalStart = orderParameters.temporalFilterLowerBound;
    const temporalEnd = orderParameters.temporalFilterUpperBound;

    const url = this.buildUrl(conceptId, spatialSelection, temporalStart, temporalEnd, textFilter);

    window.open(url, "_blank");
  }

  private buildUrl = (conceptId: CmrCollection["id"],
                      spatialSelection: OrderParameters["spatialSelection"],
                      temporalStart: OrderParameters["temporalFilterLowerBound"],
                      temporalEnd: OrderParameters["temporalFilterUpperBound"],
                      textFilter: OrderParameters["cmrGranuleFilter"]) => {
    let url = `https://search.earthdata.nasa.gov/search/granules?` +
      `p=${conceptId}` +  // TODO: Is &p= the correct param? It's not working.
      `&pg[0][qt]=${temporalStart.toISOString()},${temporalEnd.toISOString()}`;

    if (spatialSelection) {
      url = url + `&polygon=${spatialSelection.geometry.coordinates.join(",")}`;
    }
    if (textFilter) {
      url = url + `&pg[0][id]=${filterAddWildcards(textFilter)}`;
    }

    return url;
  }
}
