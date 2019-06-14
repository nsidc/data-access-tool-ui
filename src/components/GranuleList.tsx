import { List } from "immutable";
import * as moment from "moment";
import * as React from "react";
import * as ReactTooltip from "react-tooltip";

import { faSortDown, faSortUp, faUndoAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CmrGranule } from "../types/CmrGranule";
import { GranuleSorting } from "../types/OrderParameters";
import { formatBytes } from "../utils/CMR";
import { hasChanged } from "../utils/hasChanged";
import { GranuleCount } from "./GranuleCount";
import { LoadingIcon } from "./LoadingIcon";

interface IGranuleListProps {
  cmrGranuleFilter: string;
  cmrGranuleCount?: number;
  cmrGranules: List<CmrGranule>;
  cmrLoadingGranules: boolean;
  granuleSorting: GranuleSorting;
  updateGranuleFilter: any;
  updateGranuleSorting: any;
  fireGranuleFilter: any;
  totalSize: number;
}

export class GranuleList extends React.Component<IGranuleListProps, {}> {
  private static timeFormat = "YYYY-MM-DD HH:mm:ss";
  private containerId = "granule-list-container";
  private timeout = 0;

  public shouldComponentUpdate(nextProps: IGranuleListProps) {
    const propsChanged = hasChanged(this.props, nextProps,
      ["cmrGranules", "cmrGranuleFilter", "cmrLoadingGranules", "granuleSorting"]);
    return propsChanged;
  }

  // "views-field" is a class defined in the Drupal/NSIDC site css
  public render() {
    let granuleDisplayed = null;
    if (!this.props.cmrLoadingGranules && this.props.cmrGranules.size > 0 &&
      this.props.cmrGranuleCount !== this.props.cmrGranules.size) {
      granuleDisplayed = (
        <span>
          {", "}
          <GranuleCount loading = {this.props.cmrLoadingGranules} count = { this.props.cmrGranules.size} />
          {" "}displayed
        </span>
      );
    }

    const totalSize = this.props.cmrLoadingGranules ? 0 : this.props.totalSize;

    return (
      <div>
        <div id="granule-list-header">
          <div id="granule-list-count-header" className="views-field">
            <GranuleCount loading={this.props.cmrLoadingGranules} count={this.props.cmrGranuleCount} />
            {(this.props.cmrGranuleCount !== 1) ? " files " : " file "}
            selected (~{formatBytes(totalSize)})
            {granuleDisplayed}
            .
          </div>
          <div id="granule-list-filter" data-tip data-for="granuleFilter">
            <ReactTooltip id="granuleFilter" className="reactTooltip"
              disable={this.props.cmrGranuleFilter !== ""}
              effect="solid" delayShow={1000}>
              * = match any characters<br/>? = match one character</ReactTooltip>
            <input type="text"
              value={this.props.cmrGranuleFilter}
              placeholder="Search file names"
              onChange={this.granuleFilterChange}>
            </input>
          </div>
          <div onClick={(e: any) => {
            this.props.updateGranuleFilter("");
            window.setTimeout(this.props.fireGranuleFilter, 0);
            }}>
            <button className="buttonReset" data-tip="Reset search filter">
              <FontAwesomeIcon icon={faUndoAlt} size="lg" />
            </button>
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

  private columnHeader = (header: JSX.Element | string, className: string,
                          columnSortUp: GranuleSorting, columnSortDown: GranuleSorting) => {
    let newColumnSortOrder = columnSortUp;
    let classSortUp = "fa-stack-1x sort-icon";
    let classSortDown = "fa-stack-1x sort-icon";
    if (this.props.granuleSorting === columnSortUp) {
      classSortUp += " sort-active";
      newColumnSortOrder = columnSortDown;
    } else if (this.props.granuleSorting === columnSortDown) {
      classSortDown += " sort-active";
    }
    const iconUp = <FontAwesomeIcon icon={faSortUp} className={classSortUp} />;
    const iconDown = <FontAwesomeIcon icon={faSortDown} className={classSortDown} />;
    return <th className={className}><div className="sortColumn" onClick={(e: any) => {
      this.props.updateGranuleSorting(newColumnSortOrder);
    }}>{header}<span className="fa-stack sort-icon-stack">{iconUp}{iconDown}</span></div></th>;
  }

  private renderContent = () => {
    let granuleList: any = null;

    if (this.props.cmrLoadingGranules) {
      granuleList = (<tr><td colSpan={4}><LoadingIcon size="5x" /></td></tr>);
    } else {
      granuleList = this.props.cmrGranules.map((granule: CmrGranule = new CmrGranule(), i?: number) => {
        const granuleSize = granule.granule_size ? parseFloat(granule.granule_size).toFixed(1) : "N/A";
        return (
          <tr key={i}>
            <td>{granule.producer_granule_id}</td>
            <td className="size-col">{granuleSize}</td>
            <td>{moment.utc(granule.time_start).format(GranuleList.timeFormat)}</td>
            <td>{moment.utc(granule.time_end).format(GranuleList.timeFormat)}</td>
          </tr>
        );
      });
    }

    return (
      <table id="granule-table">
        <thead>
          <tr>
            {this.columnHeader("File Name", "granule-id-col",
              GranuleSorting.FilenameUp, GranuleSorting.FilenameDown)}
            {this.columnHeader(<span>Size (<small>MB</small>)</span>, "size-col",
              GranuleSorting.SizeUp, GranuleSorting.SizeDown)}
            {this.columnHeader("Start Time", "start-time-col",
              GranuleSorting.StartTimeUp, GranuleSorting.StartTimeDown)}
            {this.columnHeader("End Time", "end-time-col",
              GranuleSorting.EndTimeUp, GranuleSorting.EndTimeDown)}
          </tr>
        </thead>
        <tbody>
          {granuleList}
        </tbody>
      </table>
    );
  }
}
