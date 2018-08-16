import * as moment from "moment";
import * as React from "react";

import { IGeoJsonPolygon } from "../types/GeoJson";
import { OrderParameters } from "../types/OrderParameters";
import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { Globe } from "./Globe";
import { TemporalFilter } from "./TemporalFilter";

interface IOrderParametersProps {
  cmrStatusOk: boolean;
  environment: IEnvironment;
  onChange: any;
  onCmrRequestFailure: (response: any) => any;
  orderParameters: OrderParameters;
  resetSpatialSelection: any;
}

export class OrderParameterInputs extends React.Component<IOrderParametersProps, {}> {
  public constructor(props: any) {
    super(props);
  }

  public shouldComponentUpdate(nextProps: IOrderParametersProps) {
    return hasChanged(this.props, nextProps, ["cmrStatusOk", "environment", "orderParameters"]);
  }

  public render() {
    return (
      <div id="order-params">
        <TemporalFilter
          fromDate={this.props.orderParameters.temporalFilterLowerBound}
          onFromDateChange={(temporalFilterLowerBound: moment.Moment) =>
            this.props.onChange({temporalFilterLowerBound})}
          toDate={this.props.orderParameters.temporalFilterUpperBound}
          onToDateChange={(temporalFilterUpperBound: moment.Moment) =>
            this.props.onChange({temporalFilterUpperBound})} />
        <Globe
          spatialSelection={this.props.orderParameters.spatialSelection}
          onSpatialSelectionChange={(spatialSelection: IGeoJsonPolygon) =>
            this.props.onChange({spatialSelection})}
          resetSpatialSelection={this.props.resetSpatialSelection} />
      </div>
    );
  }
}
