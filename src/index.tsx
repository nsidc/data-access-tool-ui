import * as React from "react";
import * as ReactDOM from "react-dom";

import CollectionDropdown from "./components/CollectionDropdown";
import GranuleList from "./components/GranuleList";
import SubmitBtn from "./components/SubmitBtn";
import TemporalFilter from "./components/TemporalFilter";

interface EverestState {
  selectedCollection: string;
  temporalFilterBounds: any;
}

class EverestUI extends React.Component<{}, EverestState> {
    static displayName = "EverestUI";

    constructor(props: any) {
      super(props);
      this.handleCollectionChange = this.handleCollectionChange.bind(this);
      this.state = {
        "selectedCollection": "",
        "temporalFilterBounds": [],
      }
    }

    handleCollectionChange(collection: string) {
      this.setState({"selectedCollection": collection});
    }

    render() {
        return (
            <div className="everest-stuff">
              <CollectionDropdown
                  selectedCollection={this.state.selectedCollection}
                  onCollectionChange={this.handleCollectionChange} />
              <TemporalFilter />
              <SubmitBtn />
              <GranuleList
                  collectionId={this.state.selectedCollection}
                  temporalFilterBounds={this.state.temporalFilterBounds}/>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <EverestUI />,
    document.getElementById("everest-ui")
);
