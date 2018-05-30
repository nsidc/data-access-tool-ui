import * as moment from "moment";
import * as React from "react";

import { ISpatialSelection } from "../SpatialSelection";
import { CollectionDropdown } from "./CollectionDropdown";
import { Globe } from "./Globe";
import { GranuleList } from "./GranuleList";
import { InputCoords } from "./InputCoords";
import { SubmitBtn } from "./SubmitBtn";
import { TemporalFilter } from "./TemporalFilter";

interface IEverestState {
  selectedCollection: any;
  selectedCollectionId: string;
  spatialSelection: ISpatialSelection;
  temporalFilterLowerBound: moment.Moment;
  temporalFilterUpperBound: moment.Moment;
  granules: any;
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
      this.handleGranules = this.handleGranules.bind(this);
      this.state = {
        granules: [],
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
              <InputCoords
                selectedCoords={this.state.spatialSelection}
                onCoordChange={this.handleSpatialSelectionChange} />
            </div>
            <Globe
              spatialSelection={this.state.spatialSelection}
              onSpatialSelectionChange={(s: ISpatialSelection) => this.handleSpatialSelectionChange(s)}
              resetSpatialSelection={() => this.setSpatialSelectionToCollectionDefault()} />
            <SubmitBtn
              collectionId={this.state.selectedCollectionId}
              spatialSelection={this.state.spatialSelection}
              temporalLowerBound={this.state.temporalFilterLowerBound}
              temporalUpperBound={this.state.temporalFilterUpperBound}
              onGranuleResponse={this.handleGranules} />
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

    private handleSpatialSelectionChange(spatialSelection: ISpatialSelection) {
      this.setState({spatialSelection});
    }

    private handleTemporalLowerChange(date: moment.Moment) {
      this.setState({temporalFilterLowerBound: date});
    }

    private handleTemporalUpperChange(date: moment.Moment) {
      this.setState({temporalFilterUpperBound: date});
    }

    private handleGranules(cmrResponse: any) {
      this.setState({granules: cmrResponse});
    }

    private setSpatialSelectionToCollectionDefault() {
      const boundingBoxes = this.state.selectedCollection.boxes;
      const spatialSelection = this.cmrBoxArrToSpatialSelection(boundingBoxes);
      this.handleSpatialSelectionChange(spatialSelection);
    }
}
