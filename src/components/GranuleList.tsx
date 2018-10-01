import { List } from "immutable";
import * as moment from "moment";
import * as React from "react";
import { CSSTransition } from "react-transition-group";

import { CmrGranule } from "../types/CmrGranule";
import { OrderParameters } from "../types/OrderParameters";
import { hasChanged } from "../utils/hasChanged";
import { GranuleCount } from "./GranuleCount";
import { LoadingIcon } from "./LoadingIcon";

interface IGranuleListProps {
  cmrGranuleCount?: number;
  cmrGranuleResponse: List<CmrGranule>;
  loading: boolean;
  loadingNextPage: boolean;
  updateGranulesFromCmr: (nextPage?: boolean) => void;
  orderParameters: OrderParameters;
}

export class GranuleList extends React.Component<IGranuleListProps, {}> {
  private static timeFormat = "YYYY-MM-DD HH:mm:ss";

  public shouldComponentUpdate(nextProps: IGranuleListProps) {
    return hasChanged(this.props, nextProps, [
      "cmrGranuleResponse",
      "loading",
      "loadingNextPage",
    ]);
  }

  // "views-field" is a class defined in the Drupal/NSIDC site css
  public render() {
    return (
      <div>
        <div id="granule-list-count-header" className="views-field">
          You have selected
          {" "}<GranuleCount loading={this.props.loading} count={this.props.cmrGranuleCount} />{" "}
          granules. Displaying
          {" "}<GranuleCount loading={this.props.loadingNextPage} count={this.props.cmrGranuleResponse.size} />{" "}
          selected granules.
        </div>
        <div id="granule-list-container">
          {this.renderContent()}
          {this.renderSpinnerOrButtonForNextPage()}
        </div>
      </div>
    );
  }

  private renderSpinnerOrButtonForNextPage = () => {
    if (!this.props.loading && this.props.loadingNextPage) {
      return (<LoadingIcon size="5x" className="loading-spinner-next-page" />);
    } else {
      return (
        <button
          className="submit-button eui-btn--blue"
          onClick={() => this.props.updateGranulesFromCmr(true)}>
          Get 10 more granules
        </button>
      );
    }
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
