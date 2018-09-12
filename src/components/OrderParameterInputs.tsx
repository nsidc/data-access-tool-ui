import * as moment from "moment";
import * as React from "react";

import { IGeoJsonPolygon } from "../types/GeoJson";
import { OrderParameters } from "../types/OrderParameters";
import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { Globe } from "./Globe";
import { TemporalFilter } from "./TemporalFilter";

declare var EVEREST_UI_VERSION: string;  // defined at compile time by webpack.DefinePlugin

interface IOrderParametersProps {
  cmrStatusOk: boolean;
  environment: IEnvironment;
  onChange: any;
  orderParameters: OrderParameters;
  resetSpatialSelection: any;
}

export class OrderParameterInputs extends React.Component<IOrderParametersProps, {}> {
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
          collectionSpatialCoverage={this.props.orderParameters.collectionSpatialCoverage}
          onSpatialSelectionChange={(spatialSelection: IGeoJsonPolygon | null) =>
            this.props.onChange({spatialSelection})}
          spatialSelection={this.props.orderParameters.spatialSelection}
          resetSpatialSelection={this.props.resetSpatialSelection} />
        <div id="version">Download Data UI v{EVEREST_UI_VERSION}</div>
      </div>
    );
  }
}
