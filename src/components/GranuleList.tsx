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
  cmrGranuleFilter: string;
  cmrGranuleCount?: number;
  cmrGranules: List<CmrGranule>;
  cmrLoadingGranuleInit: boolean;
  cmrLoadingGranuleScroll: boolean;
  loadNextPageOfGranules: () => void;
  orderParameters: OrderParameters;
  updateGranuleFilter: any;
}

export class GranuleList extends React.Component<IGranuleListProps, {}> {
  private static timeFormat = "YYYY-MM-DD HH:mm:ss";

  private containerId = "granule-list-container";

  public shouldComponentUpdate(nextProps: IGranuleListProps) {
    return hasChanged(this.props, nextProps, [
      "cmrGranules",
      "cmrGranuleFilter",
      "cmrLoadingGranuleInit",
      "cmrLoadingGranuleScroll",
    ]);
  }

  // "views-field" is a class defined in the Drupal/NSIDC site css
  public render() {
    return (
      <div>
        <div id="granule-list-count-header" className="views-field">
          You have selected
          {" "}<GranuleCount loading={this.props.cmrLoadingGranuleInit} count={this.props.cmrGranuleCount} />{" "}
          granules (displaying
          {" "}<GranuleCount loading={this.props.cmrLoadingGranuleScroll} count={this.props.cmrGranules.size} />).
        </div>
        <div>
          Filter by name:
          <input id="granule-list-filter" type="text"
            disabled={!this.props.cmrGranuleCount || this.props.cmrGranuleCount === 0}
            value={this.props.cmrGranuleFilter}
            onChange={this.handleGranuleFilter}
            onKeyDown={this.granuleFilterOnKeydown}>
          </input>
        </div>
        <div id={this.containerId}>
          {this.renderContent()}
          {this.renderSpinnerForNextPage()}
        </div>
      </div>
    );
  }

  public componentDidMount = () => {
    // attach onscroll handler to container div since TypeScript will not allow
    // it via an onscroll attribute in the TSX (nor is a @ts-ignore comment able
    // to work in the TSX)
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.warn("GranuleList container div was not mounted.");
      return;
    }
    container.onscroll = this.onScroll;
  }

  private handleGranuleFilter = (e: any) => {
    this.props.updateGranuleFilter(e.target.value);
  }

  private granuleFilterOnKeydown = (e: any) => {
    switch (e.key) {
      case "Enter":
//        this.props.polygonMode.changeLonLat(e.target.value);
        break;
      case "Escape":
//        this.props.polygonMode.resetLonLat();
        break;
      case "Tab":
//        this.props.polygonMode.changeLonLat(e.target.value);
        if (e.shiftKey) {
//          this.props.polygonMode.activateRelativePoint(-1);
        } else {
//          this.props.polygonMode.activateRelativePoint(+1);
        }
        e.preventDefault();
        break;
      default:
        break;
    }
  }

  private onScroll = (event: Event) => {
    // don't want to request the next page when scrolling if there's already a
    // nextPage load in progress
    if (this.props.cmrLoadingGranuleScroll || this.props.cmrLoadingGranuleInit) { return; }

    // for browser compatibility, fallback to event.target; this happens to have
    // the type EventTarget, so cast to Element for TypeScript compatibility--we
    // can be sure it's an element because this method is only ever called from
    // the container div's `onscroll` event firing
    //
    // https://developer.mozilla.org/en-US/docs/Web/API/Event/srcElement
    // https://developer.mozilla.org/en-US/docs/Web/API/Event/target
    const el = (event.srcElement || event.target) as Element;

    if (!el || (el.id !== this.containerId)) {
      console.warn(`GranuleList.onScroll did not get div#${this.containerId} `
                   + `for event.srcElement: ${event.srcElement}`);
      return;
    }

    // @ts-ignore 2339 - TypeScript somehow doesn't think offsetHeight is real
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetHeight
    const scrollBottom = el.scrollTop + el.offsetHeight;
    const distanceFromBottom = el.scrollHeight - scrollBottom;

    // when we're this many pixels from the bottom (or even closer), trigger the
    // request for the next page of granules
    const tolerance = 0;

    // the browser might give a float for scrollTop, which could actually result
    // in a value for distanceFromBottom between -1 and 0, so we should check
    // for less-than-or-equal to the tolerance, even if the tolerance is 0
    if (distanceFromBottom <= tolerance) {
      this.props.loadNextPageOfGranules();
    }
  }

  private renderSpinnerForNextPage = () => {
    if (!this.props.cmrLoadingGranuleInit && this.props.cmrLoadingGranuleScroll) {
      return (<LoadingIcon size="5x" className="loading-spinner-next-page" />);
    } else {
      return null;
    }
  }

  private renderContent = () => {
    if (this.props.cmrLoadingGranuleInit) {
      return (<LoadingIcon size="5x" />);
    }

    const granuleList = this.props.cmrGranules.map((granule: CmrGranule = new CmrGranule(), i?: number) => {
      const granuleSize = granule.granule_size ? parseFloat(granule.granule_size).toFixed(1) : "N/A";
      return (
        <tr key={i}>
          <td>{granule.producer_granule_id}</td>
          <td>{granuleSize}</td>
          <td>{moment.utc(granule.time_start).format(GranuleList.timeFormat)}</td>
          <td>{moment.utc(granule.time_end).format(GranuleList.timeFormat)}</td>
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
