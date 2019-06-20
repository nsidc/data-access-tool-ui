import * as React from "react";

import { CmrCollection } from "../types/CmrCollection";
import { OrderParameters } from "../types/OrderParameters";
import { filterAddWildcards } from "../utils/CMR";
import { hasChanged } from "../utils/hasChanged";

interface IHandoffButtonProps {
  onClick: () => void;
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
      <button
        type="button"
        className="handoff-button eui-btn--blue"
        onClick={() => {
          this.edscRedirect(this.props.orderParameters);
          this.props.onClick();
          }}>
        OK
      </button>
    );
  }

  private edscRedirect = (orderParameters: OrderParameters) => {
    const url = this.buildUrl(orderParameters.collection.id,
                              orderParameters.spatialSelection,
                              orderParameters.temporalFilterLowerBound,
                              orderParameters.temporalFilterUpperBound,
                              orderParameters.cmrGranuleFilter);

    window.open(url, "_blank");
  }

  private buildUrl = (conceptId: CmrCollection["id"],
                      spatialSelection: OrderParameters["spatialSelection"],
                      temporalStart: OrderParameters["temporalFilterLowerBound"],
                      temporalEnd: OrderParameters["temporalFilterUpperBound"],
                      textFilter: OrderParameters["cmrGranuleFilter"]) => {
    let url = `https://search.earthdata.nasa.gov/search/granules?` +
      `p=${conceptId}` +
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
