import * as moment from "moment";
import * as React from "react";

import * as cesiumImg from "../img/cesium_credit.png";
import { BoundingBox } from "../types/BoundingBox";
import { IGeoJsonPolygon } from "../types/GeoJson";
import { OrderParameters } from "../types/OrderParameters";
import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { BoundingBoxFilter } from "./BoundingBoxFilter";
import { Globe } from "./Globe";
import { TemporalFilter } from "./TemporalFilter";

interface IOrderParametersProps {
  cmrStatusOk: boolean;
  environment: IEnvironment;
  onChange: any;
  orderParameters: OrderParameters;
  onTemporalReset: any;
  setErrorMessage: (msg: string) => void;
}

export class OrderParameterInputs extends React.Component<IOrderParametersProps, {}> {
  public shouldComponentUpdate(nextProps: IOrderParametersProps) {
    return hasChanged(this.props, nextProps, ["cmrStatusOk", "environment", "orderParameters"]);
  }

  public render() {
    const VERSION: string = process.env.VERSION || ' n/a';

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
          onClick={this.onBoundingBoxReset}
          hasPolygon={this.props.orderParameters.spatialSelection !== null}
          boundingBox={this.props.orderParameters.boundingBox}
          onBoundingBoxChange={this.onBoundingBoxChange}
        />
        <Globe
          boundingBox={this.props.orderParameters.boundingBox}
          onBoundingBoxChange={this.onBoundingBoxChange}
          collectionSpatialCoverage={this.props.orderParameters.collectionSpatialCoverage}
          onSpatialSelectionChange={(spatialSelection: IGeoJsonPolygon | null) =>
            this.props.onChange({spatialSelection})}
          setErrorMessage={this.props.setErrorMessage}
          spatialSelection={this.props.orderParameters.spatialSelection} />
        <div id="version">
          <a href="https://cesium.com/" target="_blank" title="Cesium"><img id="cesium" src={cesiumImg} alt="Cesium"/></a>
          <span>NSIDC Data Access UI v{VERSION.replace(/"/g, '')}</span></div>
      </div>
    );
  }

  private onBoundingBoxChange = (boundingBox: BoundingBox) => {
    if (this.props.orderParameters.collectionSpatialCoverage &&
      boundingBox.equals(BoundingBox.global())) {
      const bbox = this.props.orderParameters.collectionSpatialCoverage;
      boundingBox.west = Math.max(boundingBox.west, bbox.west);
      boundingBox.south = Math.max(boundingBox.south, bbox.south);
      boundingBox.south = Math.min(boundingBox.south, bbox.north);
      boundingBox.east = Math.min(boundingBox.east, bbox.east);
      boundingBox.north = Math.min(boundingBox.north, bbox.north);
      boundingBox.north = Math.max(boundingBox.north, bbox.south);
    }
    if (!this.props.orderParameters.boundingBox.equals(boundingBox)) {
      this.props.onChange({boundingBox});
    }
  }

  private onBoundingBoxReset = () => {
    const collectionBoundingBox =
      this.props.orderParameters.collectionSpatialCoverage ?
        this.props.orderParameters.collectionSpatialCoverage : BoundingBox.global();
    this.props.onChange({ boundingBox: collectionBoundingBox.clone() });
  }
}
