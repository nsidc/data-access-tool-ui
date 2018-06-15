import * as moment from "moment";
import * as React from "react";

import { ISpatialSelection } from "../types/SpatialSelection";
import { boundingBoxesToGeoJSON, defaultSpatialSelection } from "../utils/CMR";
import { CollectionDropdown } from "./CollectionDropdown";
import { Globe } from "./Globe";
import { GranuleList } from "./GranuleList";
import { SubmitButton } from "./SubmitButton";
import { TemporalFilter } from "./TemporalFilter";
import { ViewOrderPrompt } from "./ViewOrderPrompt";

interface IEverestState {
  selectedCollection: any;
  selectedCollectionId: string;
  spatialSelection: ISpatialSelection;
  temporalFilterLowerBound: moment.Moment;
  temporalFilterUpperBound: moment.Moment;
  granules?: object[];
  orderSubmitResponse?: object;
}

export class EverestUI extends React.Component<{}, IEverestState> {
    public constructor(props: any) {
      super(props);

      this.state = {
        granules: [],
        orderSubmitResponse: undefined,
        selectedCollection: {},
        selectedCollectionId: "",
        spatialSelection: defaultSpatialSelection,
        temporalFilterLowerBound: moment("20100101"),
        temporalFilterUpperBound: moment(),
      };
    }

    public render() {
      return (
        <div>
          <div id="everest-container">
            <CollectionDropdown
              selectedCollection={this.state.selectedCollection}
              onCollectionChange={this.handleCollectionChange} />
            <div id="selectors">
              <TemporalFilter
                  fromDate={this.state.temporalFilterLowerBound}
                  onFromDateChange={this.handleTemporalLowerChange}
                  toDate={this.state.temporalFilterUpperBound}
                  onToDateChange={this.handleTemporalUpperChange} />
            </div>
            <Globe
              spatialSelection={this.state.spatialSelection}
              updateSpatialSelection={(s: any) => this.handleSpatialSelectionChange(s)}
              resetSpatialSelection={() => this.setSpatialSelectionToCollectionDefault()} />
            <div>
              <SubmitButton
                collectionId={this.state.selectedCollectionId}
                spatialSelection={this.state.spatialSelection}
                temporalLowerBound={this.state.temporalFilterLowerBound}
                temporalUpperBound={this.state.temporalFilterUpperBound}
                onGranuleResponse={this.handleGranuleResponse}
                onSubmitOrderResponse={this.handleSubmitOrderResponse} />
              <ViewOrderPrompt
                orderSubmitResponse={this.state.orderSubmitResponse} />
            </div>
            <GranuleList
              collectionId={this.state.selectedCollectionId}
              granules={this.state.granules} />
            <div id="credit"/>
          </div>
        </div>
      );
    }

    private handleCollectionChange = (collection: any) => {
      this.setState({selectedCollection: collection},
                    this.setSpatialSelectionToCollectionDefault);
      this.setState({selectedCollectionId: collection.id});

      this.handleTemporalLowerChange(moment(collection.time_start));
      this.handleTemporalUpperChange(moment(collection.time_end));
    }

    private handleSpatialSelectionChange = (spatialSelection: any) => {
      this.setState({spatialSelection});
    }

    private handleTemporalLowerChange = (date: moment.Moment) => {
      this.setState({temporalFilterLowerBound: date});
    }

    private handleTemporalUpperChange = (date: moment.Moment) => {
      this.setState({temporalFilterUpperBound: date});
    }

    private handleGranuleResponse = (cmrResponse: any) => {
      this.setState({granules: cmrResponse});
    }

    private handleSubmitOrderResponse = (hermesResponse: any) => {
      this.setState({orderSubmitResponse: hermesResponse});
    }

    private setSpatialSelectionToCollectionDefault() {
      const boundingBoxes = this.state.selectedCollection.boxes;
      const spatialSelection = boundingBoxesToGeoJSON(boundingBoxes);
      this.handleSpatialSelectionChange(spatialSelection);
    }
}
