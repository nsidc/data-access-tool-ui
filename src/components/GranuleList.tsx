import { List } from "immutable";
import * as moment from "moment";
import * as React from "react";
import { CSSTransition } from "react-transition-group";

import { CmrGranule } from "../types/CmrGranule";
import { OrderParameters } from "../types/OrderParameters";
import { CmrGranuleCount } from "./CmrGranuleCount";
import { LoadingIcon } from "./LoadingIcon";

interface IGranuleListProps {
  cmrResponse: List<CmrGranule>;
  loading: boolean;
  orderParameters: OrderParameters;
}

export class GranuleList extends React.Component<IGranuleListProps, {}> {
  private static timeFormat = "YYYY-MM-DD HH:mm:ss";

  public shouldComponentUpdate(nextProps: IGranuleListProps) {
    const cmrResponseChanged = !this.props.cmrResponse.equals(nextProps.cmrResponse);
    const loadingChanged = this.props.loading !== nextProps.loading;

    return cmrResponseChanged || loadingChanged;
  }

  public render() {
    return (
      <div>
        <div>
          You have selected <CmrGranuleCount orderParameters={this.props.orderParameters} />
          {" "}granules.
        </div>
        <div id="granule-list-container">
          {this.renderContent()}
        </div>
      </div>
    );
  }

  private renderContent = () => {
    const granuleList = this.props.cmrResponse.map((granule: CmrGranule = new CmrGranule(), i?: number) => {
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

    if (this.props.loading) {
      return (<LoadingIcon size="5x" />);
    }

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
