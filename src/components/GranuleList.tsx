import { List } from "immutable";
import * as moment from "moment";
import * as React from "react";
import * as ReactTooltip from "react-tooltip";
import { CSSTransition } from "react-transition-group";

import { faSort, faSortDown, faSortUp, faUndoAlt } from "@fortawesome/free-solid-svg-icons";
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

    const up = <FontAwesomeIcon icon={faSortUp} />;
    const down = <FontAwesomeIcon icon={faSortDown} />;
    const updown = <FontAwesomeIcon icon={faSort} className="sort-icon" />;
    let fileSort = updown;
    let sizeSort = updown;
    let startTimeSort = updown;
    let endTimeSort = updown;
    let fileClass = "granule-id-col";
    let sizeClass = "size-col";
    let startTimeClass = "start-time-col";
    let endTimeClass = "end-time-col";

    switch (this.props.granuleSorting) {
      case GranuleSorting.FilenameUp:
        fileSort = up;
        fileClass += " enabled";
        break;
      case GranuleSorting.FilenameDown:
        fileSort = down;
        fileClass += " enabled";
        break;
      case GranuleSorting.SizeUp:
        sizeSort = up;
        sizeClass += " enabled";
        break;
      case GranuleSorting.SizeDown:
        sizeSort = down;
        sizeClass += " enabled";
        break;
      case GranuleSorting.StartTimeUp:
        startTimeSort = up;
        startTimeClass += " enabled";
        break;
      case GranuleSorting.StartTimeDown:
        startTimeSort = down;
        startTimeClass += " enabled";
        break;
      case GranuleSorting.EndTimeUp:
        endTimeSort = up;
        endTimeClass += " enabled";
        break;
      case GranuleSorting.EndTimeDown:
        endTimeSort = down;
        endTimeClass += " enabled";
        break;
      default:
        break;
    }

    return (
      <CSSTransition in
                     appear
                     classNames="fade"
                     timeout={500}>
        <table id="granule-table">
          <thead>
            <tr>
              <th className={fileClass}><div className="sortColumn" onClick={(e: any) => {
                this.props.updateGranuleSorting(this.props.granuleSorting === GranuleSorting.FilenameUp ?
                  GranuleSorting.FilenameDown : GranuleSorting.FilenameUp);
              }}>File Name&nbsp;{fileSort}</div></th>
              <th className={sizeClass}><div className="sortColumn" onClick={(e: any) => {
                this.props.updateGranuleSorting(this.props.granuleSorting === GranuleSorting.SizeUp ?
                  GranuleSorting.SizeDown : GranuleSorting.SizeUp);
              }}>Size (<small>MB</small>)&nbsp;{sizeSort}</div></th>
              <th className={startTimeClass}><div className="sortColumn" onClick={(e: any) => {
                this.props.updateGranuleSorting(this.props.granuleSorting === GranuleSorting.StartTimeUp ?
                  GranuleSorting.StartTimeDown : GranuleSorting.StartTimeUp);
              }}>Start Time&nbsp;{startTimeSort}</div></th>
              <th className={endTimeClass}><div className="sortColumn" onClick={(e: any) => {
                this.props.updateGranuleSorting(this.props.granuleSorting === GranuleSorting.EndTimeUp ?
                  GranuleSorting.EndTimeDown : GranuleSorting.EndTimeUp);
              }}>End Time&nbsp;{endTimeSort}</div></th>
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
