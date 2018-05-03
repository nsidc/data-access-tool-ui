import * as React from "react";
import * as ReactDOM from "react-dom";

import CollectionDropdown from "./components/CollectionDropdown";
import GranuleList from "./components/GranuleList";
import SubmitBtn from "./components/SubmitBtn";
import TemporalFilter from "./components/TemporalFilter";


class EverestUI extends React.Component {
    render() {
        return (
            <div className="everest-stuff">
              <CollectionDropdown selectedCollection={null} />
              <TemporalFilter />
              <SubmitBtn />
              <GranuleList />
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <EverestUI />,
    document.getElementById("everest-ui")
);
