import * as React from "react";
import * as ReactDOM from "react-dom";

import CollectionDropdown from "./components/CollectionDropdown";
import GranuleList from "./components/GranuleList";
import SubmitBtn from "./components/SubmitBtn";
import TemporalFilter from "./components/TemporalFilter";

interface EverestState {
  selectedCollection: string;
  temporalFilterLowerBound: any;
  temporalFilterUpperBound: any;
}

class EverestUI extends React.Component<{}, EverestState> {
    static displayName = "EverestUI";

    constructor(props: any) {
      super(props);
      this.handleCollectionChange = this.handleCollectionChange.bind(this);
      this.handleTemporalLowerChange = this.handleTemporalLowerChange.bind(this);
      this.handleTemporalUpperChange = this.handleTemporalUpperChange.bind(this);
      this.state = {
        "selectedCollection": "",
        "temporalFilterLowerBound": "",
        "temporalFilterUpperBound": "",
      }
    }

    handleCollectionChange(collection: string) {
      this.setState({"selectedCollection": collection});
    }

    handleTemporalLowerChange(date: string) {
      this.setState({"temporalFilterLowerBound": date});
    }

    handleTemporalUpperChange(date: string) {
      this.setState({"temporalFilterUpperBound": date});
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
              <SubmitBtn />
              <GranuleList
                  collectionId={this.state.selectedCollection}
                  temporalFilterLowerBound={this.state.temporalFilterLowerBound}
                  temporalFilterUpperBound={this.state.temporalFilterUpperBound}/>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <EverestUI />,
    document.getElementById("everest-ui")
);
