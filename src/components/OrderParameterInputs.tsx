import * as moment from "moment";
import * as React from "react";

import { IGeoJsonPolygon } from "../types/GeoJson";
import { IOrderParameters } from "../types/OrderParameters";
import { cmrBoxArrToSpatialSelection } from "../utils/CMR";
import { IEnvironment } from "../utils/environment";
import { CollectionDropdown } from "./CollectionDropdown";
import { Globe } from "./Globe";
import { TemporalFilter } from "./TemporalFilter";

interface IOrderParametersProps {
  cmrStatusOk: boolean;
  environment: IEnvironment;
  onChange: any;
  onCmrRequestFailure: (response: any) => any;
  orderParameters: IOrderParameters;
}

export class OrderParameterInputs extends React.Component<IOrderParametersProps, {}> {
  public constructor(props: any) {
    super(props);
    this.setSpatialSelectionToCollectionDefault = this.setSpatialSelectionToCollectionDefault.bind(this);
    this.handleCollectionChange = this.handleCollectionChange.bind(this);
  }

  public render() {
    return (
      <div id="order-params">
        <CollectionDropdown
          onCmrRequestFailure={this.props.onCmrRequestFailure}
          cmrStatusOk={this.props.cmrStatusOk}
          environment={this.props.environment}
          selectedCollection={this.props.orderParameters.collection}
          onCollectionChange={this.handleCollectionChange} />
        <div id="temporal-selection">
          <TemporalFilter
            fromDate={this.props.orderParameters.temporalFilterLowerBound}
            onFromDateChange={(temporalFilterLowerBound: moment.Moment) =>
              this.props.onChange({temporalFilterLowerBound})}
            toDate={this.props.orderParameters.temporalFilterUpperBound}
            onToDateChange={(temporalFilterUpperBound: moment.Moment) =>
              this.props.onChange({temporalFilterUpperBound})} />
        </div>
        <Globe
          onSpatialSelectionChange={(spatialSelection: IGeoJsonPolygon) =>
            this.props.onChange({spatialSelection})}
          spatialSelection={this.props.orderParameters.spatialSelection}
          resetSpatialSelection={this.setSpatialSelectionToCollectionDefault} />
      </div>
    );
  }

  private handleCollectionChange(collection: any) {
    this.props.onChange({
      collection,
      collectionId: collection.id,
      temporalFilterLowerBound: moment(collection.time_start),
      temporalFilterUpperBound: moment(collection.time_end),
    }, this.setSpatialSelectionToCollectionDefault);
  }

  private setSpatialSelectionToCollectionDefault() {
    const boundingBoxes = this.props.orderParameters.collection.boxes;
    const spatialSelection = cmrBoxArrToSpatialSelection(boundingBoxes);
    this.props.onChange({spatialSelection});
  }
}
