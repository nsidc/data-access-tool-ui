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
  loadNextPageOfGranules: () => void;
  orderParameters: OrderParameters;
}

export class GranuleList extends React.Component<IGranuleListProps, {}> {
  private static timeFormat = "YYYY-MM-DD HH:mm:ss";

  private containerId = "granule-list-container";
  private trHeight: number;

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
        <div id={this.containerId}>
          {this.renderContent()}
          {this.renderSpinnerForNextPage()}
        </div>
      </div>
    );
  }

  public componentDidMount = () => {
    // get the height of each row
    const tr = document.querySelector(`#${this.containerId} tr`);
    if (!tr) {
      console.warn("GranuleList tr could not be found.");
      return;
    }
    this.trHeight = tr.scrollHeight;

    // attach onscroll handler to container div since TypeScript will not allow
    // it via an onscroll attribute in the TSX
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.warn("GranuleList container div was not mounted.");
      return;
    }
    container.onscroll = this.onScroll;
  }

  private onScroll = (event: Event) => {
    // don't want to request the next page when scrolling if there's already a
    // nextPage load in progress
    if (this.props.loadingNextPage) { return; }

    const el = event.srcElement;

    if (!el || (el.id !== this.containerId)) {
      console.warn(`GranuleList.onScroll did not get div#${this.containerId} `
                   + `for event.srcElement: ${event.srcElement}`);
      return;
    }

    // how close to the bottom do we get before loading more? in px
    const numberOfRows = 10;  // alternate method for this might be something like CMR_PAGE_SIZE * .05
    const threshold = this.trHeight * numberOfRows;

    // @ts-ignore 2339 - TypeScript doesn't think offsetHeight is real
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetHeight
    const scrollBottom = el.scrollTop + el.offsetHeight;

    if ((el.scrollHeight - scrollBottom) <= threshold) {
      this.props.loadNextPageOfGranules();
    }
  }

  private renderSpinnerForNextPage = () => {
    if (!this.props.loading && this.props.loadingNextPage) {
      return (<LoadingIcon size="5x" className="loading-spinner-next-page" />);
    } else {
      return null;
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
