import { List } from "immutable";
import * as moment from "moment";
import * as React from "react";
import { CSSTransition } from "react-transition-group";

import { CmrGranule } from "../types/CmrGranule";
import { OrderParameters } from "../types/OrderParameters";
import { GranuleCount } from "./GranuleCount";
import { LoadingIcon } from "./LoadingIcon";

interface IGranuleListProps {
  cmrGranuleCount?: number;
  cmrGranuleResponse: List<CmrGranule>;
  loading: boolean;
  getMoreGranules: () => void;
  orderParameters: OrderParameters;
}

export class GranuleList extends React.Component<IGranuleListProps, {}> {
  private static timeFormat = "YYYY-MM-DD HH:mm:ss";

  public shouldComponentUpdate(nextProps: IGranuleListProps) {
    const cmrGranuleResponseChanged = !this.props.cmrGranuleResponse.equals(nextProps.cmrGranuleResponse);
    const loadingChanged = this.props.loading !== nextProps.loading;

    return cmrGranuleResponseChanged || loadingChanged;
  }

  // "views-field" is a class defined in the Drupal/NSIDC site css
  public render() {
    return (
      <div>
        <div id="granule-list-count-header" className="views-field">
          You have selected
          {" "}<GranuleCount loading={this.props.loading} count={this.props.cmrGranuleCount} />{" "}
          granules. Displaying{" "}
          <span id="granule-displayed-count-container">{this.props.cmrGranuleResponse.size.toLocaleString()}</span>
          {" "}selected granules.
          <button
            className="submit-button eui-btn--blue"
            onClick={this.props.getMoreGranules}>
            Get 10 more granules
          </button>
        </div>
        <div id="granule-list-container">
          {this.renderContent()}
        </div>
      </div>
    );
  }

  private renderContent = () => {
    if (this.props.loading) {
      return (<LoadingIcon size="5x" />);
    }

    const granuleList = this.props.cmrGranuleResponse.map((granule: CmrGranule = new CmrGranule(), i?: number) => {
      const granuleSize = granule.granule_size ? parseFloat(granule.granule_size).toFixed(1) : "N/A";
      return (
        <tr key={i}>
          <td>{granule.producer_granule_id}</td>
          <td>{granuleSize}</td>
          <td>{moment(granule.time_start).format(GranuleList.timeFormat)}</td>
          <td>{moment(granule.time_end).format(GranuleList.timeFormat)}</td>
        </tr>
      );
    });

    return (
      <CSSTransition in
                     appear
                     classNames="fade"
                     timeout={500}>
        <table id="granule-table">
          <thead>
            <tr>
              <th className="granule-id-col">Granule ID</th>
              <th className="size-col">Size (MB)</th>
              <th className="start-time-col">Start Time</th>
              <th className="end-time-col">End Time</th>
            </tr>
          </thead>
          <tbody>
            {granuleList}
          </tbody>
        </table>
      </CSSTransition>
    );
  }
}
