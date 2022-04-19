import { List } from "immutable";
import * as moment from "moment";
import * as React from "react";
import ReactTooltip from "react-tooltip";

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
    const granuleListCount = (
      <div id="granule-list-count-header" className="views-field">
        <GranuleCount loading={this.props.cmrLoadingGranules} count={this.props.cmrGranuleCount} />
        {(this.props.cmrGranuleCount !== 1) ? " files " : " file "}
        selected (~{formatBytes(totalSize)})
        {granuleDisplayed}
      </div>
    );
    const firstGranule = this.props.cmrGranules.get(0);
    const disableFilter = firstGranule ? (firstGranule.producer_granule_id === "") : false;
    const tooltip = disableFilter ?
      "File name filter is unavailable for datasets with multi-file granules" :
      "'*' match multiple characters; '?' match one character; ',' combine queries; Example: *2019??01*,*2020??01*";

    return (
      <div>
        <div id="granule-list-header">
          {granuleListCount}
          <div data-tip data-for="granuleFilter">
            <ReactTooltip id="granuleFilter" className="reactTooltip"
              disable={this.props.cmrGranuleFilter !== ""}
              effect="solid" delayShow={1000}>
              {tooltip}</ReactTooltip>
            <input id="granule-list-input" type="text"
              disabled={disableFilter}
              value={this.props.cmrGranuleFilter}
              placeholder="Search file names"
              onChange={this.granuleFilterChange}>
            </input>
          </div>
          <div>
            <button className="buttonReset" data-tip="Reset search filter"
              disabled={disableFilter}
              onClick={(e: any) => {
                this.props.updateGranuleFilter("");
                window.setTimeout(this.props.fireGranuleFilter, 0);
              }}>
              <FontAwesomeIcon icon={faUndoAlt} size="lg" />
            </button>
          </div>
        </div>
        <div id={this.containerId}>
          {this.renderContent()}
        </div>
        {granuleListCount}
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
            <td>{this.getGranuleID(granule)}</td>
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

  private getGranuleID = (granule: CmrGranule) => {
    let granuleID = granule.producer_granule_id;
    if (granuleID) {
      return granuleID;
    }
    let basename = "";
    const filenames: string[] = [];
    granule.links.forEach((linkIn) => {
      if (linkIn) {
        const link = linkIn.toJS();
        if (!link.inherited && link.rel && link.href) {
          const rel = link.rel as string;
          const h = link.href as string;
          if (rel.endsWith("metadata#")) {
            basename = h.substr(h.lastIndexOf("/") + 1);
            basename = basename.substr(0, basename.lastIndexOf(".xml") + 1);
          } else if (rel.endsWith("/data#")) {
            filenames.push(h.substr(h.lastIndexOf("/") + 1));
          }
        }
      }
    });
    if (basename) {
      for (const f of filenames) {
        if (f.startsWith(basename)) {
          granuleID = f;
          break;
        }
      }
    }
    return granuleID;
  }
}
