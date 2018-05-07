import * as moment from "moment";
import * as React from "react";
import { SpatialSelection } from "../SpatialSelection";

const CMR_GRANULE_URL = "https://cmr.earthdata.nasa.gov/search/granules.json?page_size=50&provider=NSIDC_ECS&sort_key=short_name";

interface SubmitButtonProps {
  collectionId: string;
  spatialSelection: SpatialSelection;
  temporalLowerBound: moment.Moment;
  temporalUpperBound: moment.Moment;
  onGranuleResponse: any;
}

interface SubmitButtonState {
  cmrResponse: any;
}

export class SubmitBtn extends React.Component<SubmitButtonProps, SubmitButtonState> {
  displayName = "SubmitBtn";

  constructor(props: any) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.cmrRequest = this.cmrRequest.bind(this);
    this.handleCmrResponse = this.handleCmrResponse.bind(this);
    this.state = {
      cmrResponse: null
    };
  }

  handleCmrResponse(cmrResponseJSON: any) {
    this.setState({"cmrResponse": cmrResponseJSON.feed.entry});
    this.props.onGranuleResponse(this.state.cmrResponse);
  }


  cmrRequest(collectionId: string, spatialSelection: SpatialSelection, temporalLowerBound: moment.Moment, temporalUpperBound: moment.Moment) {
    const URL = CMR_GRANULE_URL
      + `&concept_id=${this.props.collectionId}`
      + `&temporal\[\]=${temporalLowerBound.utc().format()},${temporalUpperBound.utc().format()}`
      + `&bounding_box=${spatialSelection.lower_left_lon},${spatialSelection.lower_left_lat},${spatialSelection.upper_right_lon},${spatialSelection.upper_right_lat}`;
    console.log(`Request to CMR with: ${collectionId}, ${temporalLowerBound}, ${temporalUpperBound}:\n  ${URL}`);
    fetch(URL)
        .then(response => response.json())
        .then(json => this.handleCmrResponse(json));
  }

  handleClick() {
    if (this.props.collectionId && this.props.spatialSelection && this.props.temporalLowerBound && this.props.temporalUpperBound) {
      this.cmrRequest(this.props.collectionId, this.props.spatialSelection, this.props.temporalLowerBound, this.props.temporalUpperBound);
    } else {
      console.log("Insufficient props provided.");
    }
    return;
  }

  render() {
    return (
      <div id="submit-container">
        <button onClick={this.handleClick}>Submit</button>
      </div>
    );
  }
}
