import { List } from "immutable";
import * as moment from "moment";
import * as React from "react";
import * as ReactTooltip from "react-tooltip";
import { CSSTransition } from "react-transition-group";

import { CmrGranule } from "../types/CmrGranule";
import { hasChanged } from "../utils/hasChanged";
import { GranuleCount } from "./GranuleCount";
import { LoadingIcon } from "./LoadingIcon";

interface IGranuleListProps {
  cmrGranuleFilter: string;
  cmrGranuleCount?: number;
  cmrGranules: List<CmrGranule>;
  cmrLoadingGranules: boolean;
  updateGranuleFilter: any;
  fireGranuleFilter: any;
}

export class GranuleList extends React.Component<IGranuleListProps, {}> {
  private static timeFormat = "YYYY-MM-DD HH:mm:ss";
  private containerId = "granule-list-container";
  private timeout = 0;

  public shouldComponentUpdate(nextProps: IGranuleListProps) {
    const propsChanged = hasChanged(this.props, nextProps,
      ["cmrGranules", "cmrGranuleFilter", "cmrLoadingGranules"]);
    return propsChanged;
  }

  // "views-field" is a class defined in the Drupal/NSIDC site css
  public render() {
    return (
      <div>
        <div id="granule-list-header">
          <div id="granule-list-count-header" className="views-field">
            <GranuleCount loading={this.props.cmrLoadingGranules} count={this.props.cmrGranuleCount} />{" "}
            granules selected,
            {" "}<GranuleCount loading={this.props.cmrLoadingGranules} count={this.props.cmrGranules.size} />
            {" "}displayed.
          </div>
          <div id="granule-list-filter" data-tip data-for="granuleFilter">
            <ReactTooltip id="granuleFilter" className="reactTooltip"
              disable={this.props.cmrGranuleFilter !== ""}
              effect="solid" delayShow={1000}>
              * = match any characters<br/>? = match one character</ReactTooltip>
            <input type="text"
              value={this.props.cmrGranuleFilter}
              placeholder="Search granule list"
              onChange={this.granuleFilterChange}>
            </input>
          </div>
        </div>
        <div id={this.containerId}>
          {this.renderContent()}
        </div>
      </div>
    );
  }

  private granuleFilterChange = (e: any) => {
    ReactTooltip.hide();
    if (e.target.value === this.props.cmrGranuleFilter) { return; }
    if (this.timeout) { window.clearTimeout(this.timeout); }
    this.props.updateGranuleFilter(e.target.value);
    this.timeout = window.setTimeout(this.props.fireGranuleFilter, 600);
  }

  private renderContent = () => {
    if (this.props.cmrLoadingGranules) {
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
