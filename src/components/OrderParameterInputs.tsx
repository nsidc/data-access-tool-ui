import * as moment from "moment";
import * as React from "react";

import { IOrderParameters } from "../types/OrderParameters";
import { ISpatialSelection } from "../types/SpatialSelection";
import { cmrBoxArrToSpatialSelection } from "../utils/CMR";
import { CollectionDropdown } from "./CollectionDropdown";
import { Globe } from "./Globe";
import { TemporalFilter } from "./TemporalFilter";

interface IOrderParametersProps {
  onChange: any;
  orderParameters: IOrderParameters;
}

export class OrderParameterInputs extends React.Component<IOrderParametersProps, {}> {
  public constructor(props: any) {
    super(props);
    this.setSpatialSelectionToCollectionDefault = this.setSpatialSelectionToCollectionDefault.bind(this);
    this.handleCollectionChange = this.handleCollectionChange.bind(this);
    this.handleTemporalLowerChange = this.handleTemporalLowerChange.bind(this);
    this.handleTemporalUpperChange = this.handleTemporalUpperChange.bind(this);
    this.handleSpatialSelectionChange = this.handleSpatialSelectionChange.bind(this);
  }

  public render() {
    return (
      <div id="order-params">
        <CollectionDropdown
          selectedCollection={this.props.orderParameters.collection}
          onCollectionChange={this.handleCollectionChange} />
        <div id="selectors">
          <TemporalFilter
            fromDate={this.props.orderParameters.temporalFilterLowerBound}
            onFromDateChange={this.handleTemporalLowerChange}
            toDate={this.props.orderParameters.temporalFilterUpperBound}
            onToDateChange={this.handleTemporalUpperChange} />
        </div>
        <Globe
          onSpatialSelectionChange={this.handleSpatialSelectionChange}
          spatialSelection={this.props.orderParameters.spatialSelection}
          resetSpatialSelection={this.setSpatialSelectionToCollectionDefault} />
      </div>
    );
  }

  private setSpatialSelectionToCollectionDefault() {
    const boundingBoxes = this.props.orderParameters.collection.boxes;
    const spatialSelection = cmrBoxArrToSpatialSelection(boundingBoxes);
    this.props.onChange({spatialSelection});
  }

  private handleCollectionChange(collection: any) {
    this.props.onChange({
      collection,
      collectionId: collection.id,
      temporalFilterLowerBound: moment(collection.time_start),
      temporalFilterUpperBound: moment(collection.time_end),
    }, this.setSpatialSelectionToCollectionDefault);
  }
  private handleTemporalLowerChange(temporalFilterLowerBound: moment.Moment) {
    this.props.onChange({temporalFilterLowerBound});
  }
  private handleTemporalUpperChange(temporalFilterUpperBound: moment.Moment) {
    this.props.onChange({temporalFilterUpperBound});
  }
  private handleSpatialSelectionChange(spatialSelection: ISpatialSelection) {
    this.props.onChange({spatialSelection});
  }
}
