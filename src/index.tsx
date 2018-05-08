import * as moment from "moment";
import * as React from "react";
import * as ReactDOM from "react-dom";

import CollectionDropdown from "./components/CollectionDropdown";
import GranuleList from "./components/GranuleList";
import SubmitBtn from "./components/SubmitBtn";
import TemporalFilter from "./components/TemporalFilter";

interface EverestState {
  selectedCollection: string;
  temporalFilterLowerBound: moment.Moment | null;
  temporalFilterUpperBound: moment.Moment | null;
  granules: any;
}

class EverestUI extends React.Component<{}, EverestState> {
    static displayName = "EverestUI";

    constructor(props: any) {
      super(props);
      this.handleCollectionChange = this.handleCollectionChange.bind(this);
      this.handleTemporalLowerChange = this.handleTemporalLowerChange.bind(this);
      this.handleTemporalUpperChange = this.handleTemporalUpperChange.bind(this);
      this.handleGranules = this.handleGranules.bind(this);
      this.state = {
        "selectedCollection": "",
        "temporalFilterLowerBound": null,
        "temporalFilterUpperBound": null,
        "granules": [{}],
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
                  temporalFilterLowerBound={this.state.temporalFilterLowerBound}
                  temporalFilterUpperBound={this.state.temporalFilterUpperBound}
                  granuleList={this.state.granules} />
            </div>
        );
    }
}

// ========================================

const renderApp = () => {
      ReactDOM.render(
          <EverestUI />,
          document.getElementById("everest-ui")
      );
};

declare var Drupal: any;

// If the app is being rendered in Drupal, wait for the page to load first
if (typeof(Drupal) !== "undefined") {
  Drupal.behaviors.AppBehavior = {
    attach: function(context: any, settings: any) {
      renderApp();
    }
  };
} else {
  renderApp();
}
