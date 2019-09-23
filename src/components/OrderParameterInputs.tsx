import * as moment from "moment";
import * as React from "react";

import * as cesiumImg from "../img/cesium_credit.png";
import { IGeoJsonPolygon } from "../types/GeoJson";
import { OrderParameters } from "../types/OrderParameters";
import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { BoundingBoxFilter } from "./BoundingBoxFilter";
import { Globe } from "./Globe";
import { TemporalFilter } from "./TemporalFilter";

declare var EVEREST_UI_VERSION: string;  // defined at compile time by webpack.DefinePlugin

interface IOrderParametersProps {
  cmrStatusOk: boolean;
  environment: IEnvironment;
  onChange: any;
  orderParameters: OrderParameters;
  onTemporalReset: any;
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
            this.props.onChange({temporalFilterUpperBound})}
          timeErrorLowerBound={this.props.orderParameters.timeErrorLowerBound}
          timeErrorUpperBound={this.props.orderParameters.timeErrorUpperBound}
          onClick={this.props.onTemporalReset}
        />
        <BoundingBoxFilter
          onClick={this.props.onTemporalReset}
          boundingBox={this.props.orderParameters.boundingBox}
          updateBoundingBox={this.updateBoundingBox}
        />
        <Globe
          collectionSpatialCoverage={this.props.orderParameters.collectionSpatialCoverage}
          onSpatialSelectionChange={(spatialSelection: IGeoJsonPolygon | null) =>
            this.props.onChange({spatialSelection})}
          spatialSelection={this.props.orderParameters.spatialSelection} />
        <div id="version">
          <a href="https://cesiumjs.org" target="_blank"><img id="cesium" src={cesiumImg} alt="Cesium"/></a>
          <span>NSIDC UI v{EVEREST_UI_VERSION}</span></div>
      </div>
    );
  }

  private updateBoundingBox = (boundingBox: number[]) => {
    this.props.onChange({ boundingBox });
  }
}
