import * as moment from "moment";
import * as React from "react";

import { ISpatialSelection } from "../SpatialSelection";
import { CollectionDropdown } from "./CollectionDropdown";
import { Globe } from "./Globe";
import { GranuleList } from "./GranuleList";
import { SubmitButton } from "./SubmitButton";
import { TemporalFilter } from "./TemporalFilter";
import { ViewOrderButton } from "./ViewOrderButton";

interface IEverestState {
  selectedCollection: any;
  selectedCollectionId: string;
  spatialSelection: ISpatialSelection;
  temporalFilterLowerBound: moment.Moment;
  temporalFilterUpperBound: moment.Moment;
  granules?: object[];
  orderSubmitResponse?: object;
  orderViewResponse?: object;
}

const defaultSpatialSelection = {
    lower_left_lat: -90,
    lower_left_lon: -180,
    upper_right_lat: 90,
    upper_right_lon: 180,
};

export class EverestUI extends React.Component<{}, IEverestState> {
    public constructor(props: any) {
      super(props);
      this.handleCollectionChange = this.handleCollectionChange.bind(this);
      this.handleTemporalLowerChange = this.handleTemporalLowerChange.bind(this);
      this.handleTemporalUpperChange = this.handleTemporalUpperChange.bind(this);
      this.handleSpatialSelectionChange = this.handleSpatialSelectionChange.bind(this);
      this.handleGranuleResponse = this.handleGranuleResponse.bind(this);
      this.handleSubmitOrderResponse = this.handleSubmitOrderResponse.bind(this);
      this.handleViewOrderResponse = this.handleViewOrderResponse.bind(this);
      this.state = {
        granules: [],
        orderSubmitResponse: undefined,
        orderViewResponse: undefined,
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
              <ViewOrderButton
                onViewOrderResponse={this.handleViewOrderResponse}
                orderViewResponse={this.state.orderViewResponse}
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

    // take the list of bounding boxes from a CMR response
    //  (e.g., ["-90 -180 90 180"]) and return a SpatialSelection encompassing
    // them all
    private cmrBoxArrToSpatialSelection(boxes: string[]) {
      if (!boxes) {
        return defaultSpatialSelection;
      }

      const souths: number[] = [];
      const wests: number[] = [];
      const norths: number[] = [];
      const easts: number[] = [];

      boxes.forEach((box: string) => {
        const coords: number[] = box.split(" ")
                                    .map(parseFloat)
                                    .map((f) => f.toFixed(2))
                                    .map(parseFloat);
        souths.push(coords[0]);
        wests.push(coords[1]);
        norths.push(coords[2]);
        easts.push(coords[3]);
      });

      const finalSouth: number = Math.min.apply(null, souths);
      const finalWest: number = Math.min.apply(null, wests);
      const finalNorth: number = Math.max.apply(null, norths);
      const finalEast: number = Math.max.apply(null, easts);

      return {
        lower_left_lat: finalSouth,
        lower_left_lon: finalWest,
        upper_right_lat: finalNorth,
        upper_right_lon: finalEast,
      };
    }

    private handleCollectionChange(collection: any) {
      this.setState({selectedCollection: collection},
                    this.setSpatialSelectionToCollectionDefault);
      this.setState({selectedCollectionId: collection.id});

      this.handleTemporalLowerChange(moment(collection.time_start));
      this.handleTemporalUpperChange(moment(collection.time_end));
    }

    private handleSpatialSelectionChange(spatialSelection: any) {
      this.setState({spatialSelection});
    }

    private handleTemporalLowerChange(date: moment.Moment) {
      this.setState({temporalFilterLowerBound: date});
    }

    private handleTemporalUpperChange(date: moment.Moment) {
      this.setState({temporalFilterUpperBound: date});
    }

    private handleGranuleResponse(cmrResponse: any) {
      this.setState({granules: cmrResponse});
    }

    private handleSubmitOrderResponse(hermesResponse: any) {
      this.setState({orderSubmitResponse: hermesResponse});
    }

    private handleViewOrderResponse(hermesResponse: any) {
      this.setState({orderViewResponse: hermesResponse});
    }

    private setSpatialSelectionToCollectionDefault() {
      const boundingBoxes = this.state.selectedCollection.boxes;
      const spatialSelection = this.cmrBoxArrToSpatialSelection(boundingBoxes);
      this.handleSpatialSelectionChange(spatialSelection);
    }
}
