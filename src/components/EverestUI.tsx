import * as moment from "moment";
import * as React from "react";

import { SpatialSelection } from "../SpatialSelection";
import { CollectionDropdown } from "./CollectionDropdown";
import { Globe } from "./Globe";
import { GranuleList } from "./GranuleList";
import { InputCoords } from "./InputCoords";
import { SubmitBtn } from "./SubmitBtn";
import { TemporalFilter } from "./TemporalFilter";

interface EverestState {
  selectedCollection: any;
  selectedCollectionId: string;
  spatialSelection: SpatialSelection;
  temporalFilterLowerBound: moment.Moment | null;
  temporalFilterUpperBound: moment.Moment | null;
  granules: any;
}

export class EverestUI extends React.Component<{}, EverestState> {
    static displayName = "EverestUI";

    constructor(props: any) {
      super(props);
      this.handleCollectionChange = this.handleCollectionChange.bind(this);
      this.handleSpatialSelectionChange = this.handleSpatialSelectionChange.bind(this);
      this.handleTemporalLowerChange = this.handleTemporalLowerChange.bind(this);
      this.handleTemporalUpperChange = this.handleTemporalUpperChange.bind(this);
      this.handleGranules = this.handleGranules.bind(this);
      this.state = {
        spatialSelection: {
            lower_left_lon: -80,
            lower_left_lat: 40,
            upper_right_lon: 100,
            upper_right_lat: 80
        },
        selectedCollection: {},
        selectedCollectionId: "",
        temporalFilterLowerBound: moment("20100101"),
        temporalFilterUpperBound: moment(),
        granules: [{}],
      };
    }

    // take the list of boxes (e.g., ["-90 -180 90 180"]) and return a
    // SpatialSelection encompassing them all
    boxesToPoints(boxes: Array<string>) {
      let souths: Array<number> = [];
      let wests: Array<number> = [];
      let norths: Array<number> = [];
      let easts: Array<number> = [];

      boxes.forEach((box: string) => {
        const coords: Array<number> = box.split(" ").map((c: string) => parseInt(c, 10));
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
        upper_right_lon: finalEast
      };
    }

    handleCollectionChange(collection: any) {
      this.setState({"selectedCollection": collection});
      this.setState({"selectedCollectionId": collection.id});

      this.handleTemporalLowerChange(moment(collection.time_start));
      this.handleTemporalUpperChange(moment(collection.time_end));

      const points = this.boxesToPoints(collection.boxes);
      this.handleSpatialSelectionChange(points);
    }

    handleSpatialSelectionChange(spatialSelection: SpatialSelection) {
      this.setState({"spatialSelection": spatialSelection});
    }

    handleTemporalLowerChange(date: moment.Moment) {
      this.setState({"temporalFilterLowerBound": date});
    }

    handleTemporalUpperChange(date: moment.Moment) {
      this.setState({"temporalFilterUpperBound": date});
    }

    handleGranules(cmrResponse: any) {
      this.setState({"granules": cmrResponse});
    }

    render() {
        return (
            <div className="everest-stuff">
              <CollectionDropdown
                  selectedCollection={this.state.selectedCollection}
                  onCollectionChange={this.handleCollectionChange} />
              <Globe
                spatialSelection={this.state.spatialSelection}
                onSpatialSelectionChange={this.handleSpatialSelectionChange} />
              <div id="temporal-filter">
                  <TemporalFilter
                      selectedDate={this.state.temporalFilterLowerBound}
                      onDateChange={this.handleTemporalLowerChange} />
                  <TemporalFilter
                      selectedDate={this.state.temporalFilterUpperBound}
                      onDateChange={this.handleTemporalUpperChange} />
              </div>
              <InputCoords
                selectedCoords={this.state.spatialSelection}
                onCoordChange={this.handleSpatialSelectionChange} />
              <SubmitBtn
                  collectionId={this.state.selectedCollectionId}
                  spatialSelection={this.state.spatialSelection}
                  temporalLowerBound={this.state.temporalFilterLowerBound}
                  temporalUpperBound={this.state.temporalFilterUpperBound}
                  onGranuleResponse={this.handleGranules} />
              <GranuleList
                  collectionId={this.state.selectedCollectionId}
                  spatialSelection={this.state.spatialSelection}
                  temporalFilterLowerBound={this.state.temporalFilterLowerBound}
                  temporalFilterUpperBound={this.state.temporalFilterUpperBound}
                  granules={this.state.granules} />
            </div>
        );
    }
}
