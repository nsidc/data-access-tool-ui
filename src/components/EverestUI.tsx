import * as moment from "moment";
import * as React from "react";

import { SpatialSelection } from "../SpatialSelection";
import { CollectionDropdown } from "./CollectionDropdown";
import { Globe } from "./Globe";
import { GranuleList } from "./GranuleList";
import { SubmitBtn } from "./SubmitBtn";
import { TemporalFilter } from "./TemporalFilter";

interface EverestState {
  selectedCollection: string;
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
        selectedCollection: "",
        temporalFilterLowerBound: moment("20100101"),
        temporalFilterUpperBound: moment(),
        granules: [{}],
      };
    }

    handleCollectionChange(collection: string) {
      this.setState({"selectedCollection": collection});
    }

    handleSpatialSelectionChange() {
      console.log("spatial selection updated");
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
                  collectionId={this.state.selectedCollection}
                  spatialSelection={this.state.spatialSelection}
                  temporalLowerBound={this.state.temporalFilterLowerBound}
                  temporalUpperBound={this.state.temporalFilterUpperBound}
                  onGranuleResponse={this.handleGranules} />
              <GranuleList
                  collectionId={this.state.selectedCollection}
                  spatialSelection={this.state.spatialSelection}
                  temporalFilterLowerBound={this.state.temporalFilterLowerBound}
                  temporalFilterUpperBound={this.state.temporalFilterUpperBound}
                  granules={this.state.granules} />
            </div>
        );
    }
}
