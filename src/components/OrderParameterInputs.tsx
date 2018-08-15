import * as moment from "moment";
import * as React from "react";

import { IGeoJsonPolygon } from "../types/GeoJson";
import { OrderParameters } from "../types/OrderParameters";
import { cmrBoxArrToSpatialSelection } from "../utils/CMR";
import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { CollectionDropdown } from "./CollectionDropdown";
import { Globe } from "./Globe";
import { TemporalFilter } from "./TemporalFilter";

interface IOrderParametersProps {
  cmrStatusOk: boolean;
  environment: IEnvironment;
  onChange: any;
  onCmrRequestFailure: (response: any) => any;
  orderParameters: OrderParameters;
}

export class OrderParameterInputs extends React.Component<IOrderParametersProps, {}> {
  public shouldComponentUpdate(nextProps: IOrderParametersProps) {
    return hasChanged(this.props, nextProps, ["cmrStatusOk", "environment", "orderParameters"]);
  }

  public render() {
    let collectionDropdown = null;
    if (!this.props.environment.inDrupal) {
      collectionDropdown = (
        <CollectionDropdown
          onCmrRequestFailure={this.props.onCmrRequestFailure}
          cmrStatusOk={this.props.cmrStatusOk}
          onCollectionChange={this.handleCollectionChange} />
      );
    }

    return (
      <div id="order-params">
        {collectionDropdown}
        <TemporalFilter
          fromDate={this.props.orderParameters.temporalFilterLowerBound}
          onFromDateChange={(temporalFilterLowerBound: moment.Moment) =>
            this.props.onChange({temporalFilterLowerBound})}
          toDate={this.props.orderParameters.temporalFilterUpperBound}
          onToDateChange={(temporalFilterUpperBound: moment.Moment) =>
            this.props.onChange({temporalFilterUpperBound})} />
        <Globe
          onSpatialSelectionChange={(spatialSelection: IGeoJsonPolygon) =>
            this.props.onChange({spatialSelection})}
          spatialSelection={this.props.orderParameters.spatialSelection}
          resetSpatialSelection={this.setSpatialSelectionToCollectionDefault} />
      </div>
    );
  }

  private handleCollectionChange = (collection: any) => {
    this.props.onChange({
      collection,
      temporalFilterLowerBound: moment(collection.time_start),
      temporalFilterUpperBound: collection.time_end ? moment(collection.time_end) : moment(),
    }, this.setSpatialSelectionToCollectionDefault);
  }

  private setSpatialSelectionToCollectionDefault = () => {
    const boundingBoxes = this.props.orderParameters.collection.boxes;
    const spatialSelection = cmrBoxArrToSpatialSelection(boundingBoxes);
    this.props.onChange({spatialSelection});
  }
}
