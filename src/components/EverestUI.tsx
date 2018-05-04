import * as moment from "moment";
import * as React from "react";

import { BoundingBox } from "../BoundingBox";
import { CollectionDropdown } from "./CollectionDropdown";
import { Globe } from "./Globe";
import { Toolbar } from "./Toolbar";
import { GranuleList } from "./GranuleList";
import { SubmitBtn } from "./SubmitBtn";
import { TemporalFilter } from "./TemporalFilter";


interface EverestState {
  selectedCollection: string;
  boundingBox: BoundingBox;
  temporalFilterLowerBound: moment.Moment | null;
  temporalFilterUpperBound: moment.Moment | null;
  granules: any;
}

export class EverestUI extends React.Component<{}, EverestState> {
    static displayName = "EverestUI";

    constructor(props: any) {
      super(props);
      this.handleCollectionChange = this.handleCollectionChange.bind(this);
      this.handleTemporalLowerChange = this.handleTemporalLowerChange.bind(this);
      this.handleTemporalUpperChange = this.handleTemporalUpperChange.bind(this);
      this.handleGranules = this.handleGranules.bind(this);
      this.state = {
        boundingBox: {
            lower_left_lon: -180,
            lower_left_lat: 0,
            upper_right_lon: 180,
            upper_right_lat: 90
        },
        selectedCollection: "",
        temporalFilterLowerBound: null,
        temporalFilterUpperBound: null,
        granules: [{}],
      };
    }

    handleCollectionChange(collection: string) {
      this.setState({"selectedCollection": collection});
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
              <Globe/>
              <Toolbar/>
              <span>
                  <TemporalFilter
                      selectedDate={this.state.temporalFilterLowerBound}
                      onDateChange={this.handleTemporalLowerChange} />
                  <TemporalFilter
                      selectedDate={this.state.temporalFilterUpperBound}
                      onDateChange={this.handleTemporalUpperChange} />
              </span>
              <SubmitBtn
                  collectionId={this.state.selectedCollection}
                  temporalLowerBound={this.state.temporalFilterLowerBound}
                  temporalUpperBound={this.state.temporalFilterUpperBound}
                  onGranuleResponse={this.handleGranules} />
              <GranuleList
                  collectionId={this.state.selectedCollection}
                  boundingBox={this.state.boundingBox}
                  temporalFilterLowerBound={this.state.temporalFilterLowerBound}
                  temporalFilterUpperBound={this.state.temporalFilterUpperBound}
                  granules={this.state.granules} />
            </div>
        );
    }
}
