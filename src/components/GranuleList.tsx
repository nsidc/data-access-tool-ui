import { List } from "immutable";
import * as moment from "moment";
import * as React from "react";
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
}

interface IGranuleListState {
  tempGranuleFilter: string;
}

export class GranuleList extends React.Component<IGranuleListProps, IGranuleListState> {
  private static timeFormat = "YYYY-MM-DD HH:mm:ss";
  private containerId = "granule-list-container";
  private timeout = 0;

  public constructor(props: IGranuleListProps) {
    super(props);

    this.state = {
      tempGranuleFilter: "",
    };
  }

  public shouldComponentUpdate(nextProps: IGranuleListProps, nextState: IGranuleListState) {
    const propsChanged = hasChanged(this.props, nextProps,
      ["cmrGranules", "cmrGranuleFilter", "cmrLoadingGranules"]);
    const stateChanged = hasChanged(this.state, nextState, ["tempGranuleFilter"]);
    return propsChanged || stateChanged;
  }

  // "views-field" is a class defined in the Drupal/NSIDC site css
  public render() {
    return (
      <div>
        <div id="granule-list-count-header" className="views-field">
          You have selected
          {" "}<GranuleCount loading={this.props.cmrLoadingGranules} count={this.props.cmrGranuleCount} />{" "}
          granules (displaying
          {" "}<GranuleCount loading={this.props.cmrLoadingGranules} count={this.props.cmrGranules.size} />).
        </div>
        <div>
          Filter by ID:
          <input id="granule-list-filter" type="text"
            value={this.state.tempGranuleFilter}
            onChange={this.granuleFilterChange}>
          </input>
        </div>
        <div id={this.containerId}>
          {this.renderContent()}
        </div>
      </div>
    );
  }

  private handleGranuleFilter = (e: any) => {
    this.props.updateGranuleFilter(this.state.tempGranuleFilter);
  }

  private granuleFilterChange = (e: any) => {
    if (e.target.value === this.state.tempGranuleFilter) { return; }
    this.setState({ tempGranuleFilter: e.target.value });
    if (this.timeout) { window.clearTimeout(this.timeout); }
    this.timeout = window.setTimeout(this.handleGranuleFilter, 500);
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
