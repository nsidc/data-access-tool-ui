import * as moment from "moment";
import * as React from "react";

import { SpatialSelection } from "../SpatialSelection";
import { CollectionDropdown } from "./CollectionDropdown";
import { Globe } from "./Globe";
import { GranuleList } from "./GranuleList";
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
            lower_left_lon: -180,
            lower_left_lat: -90,
            upper_right_lon: 180,
            upper_right_lat: 90
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
      let souths: any = [];
      let wests: any = [];
      let norths: any = [];
      let easts: any = [];

      boxes.forEach((box: string) => {
        const coords = box.split(" ");
        souths.push(parseInt(coords[0]));
        wests.push(parseInt(coords[1]));
        norths.push(parseInt(coords[2]));
        easts.push(parseInt(coords[3]));
      });

      const finalSouth = Math.min.apply(null, souths);
      const finalWest = Math.min.apply(null, wests);
      const finalNorth = Math.max.apply(null, norths);
      const finalEast = Math.max.apply(null, easts);

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
                onSpatialSelectionChange={this.handleSpatialSelectionChange} />
              <div id="temporal-filter">
                  <TemporalFilter
                      selectedDate={this.state.temporalFilterLowerBound}
                      onDateChange={this.handleTemporalLowerChange} />
                  <TemporalFilter
                      selectedDate={this.state.temporalFilterUpperBound}
                      onDateChange={this.handleTemporalUpperChange} />
              </div>
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
