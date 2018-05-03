import * as fetch from 'isomorphic-fetch';

let Cesium = require('cesium/Cesium');
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './index.css';
// TODO: How? This gives a webpack error due to a png
require('cesium/Widgets/widgets.css');


// TODO: we will want short_name and version_id
// Weird, but true: when we make the graule query we pass short_name
// and version, not version_id.
const CMR_COLLECTION_URL = 'https://cmr.earthdata.nasa.gov/search/collections.json?page_size=500&provider=NSIDC_ECS&sort_key=short_name';

class SpatialUI extends React.Component {
    render() {
        return (
            <div>
              <CollectionSelector/>
              <Globe/>
              <button type="button" name="Go!" placeholder="">Go!</button>
              <GranuleList/>
            </div>
        );
    }
}

interface CollectionsState {
    collections: any
}

class CollectionSelector extends React.Component<{}, CollectionsState> {
    constructor(props: any) {
        super(props);
        this.state = {
            collections: null
        }
    }

    componentDidMount() {
        fetch(CMR_COLLECTION_URL)
            .then(response => response.json())
            .then(response => this.setState({
                collections: response.feed.entry
            }));
    }

    render() {
        let collectionOptions = null;

        if (this.state.collections) {
            collectionOptions = this.state.collections.map((c:any) => (
                <option>{c.dataset_id}</option>
            ));
        }

        return (
            <select className="dropdown" name="collections">
              {collectionOptions}
            </select>
        )
    }
}

class Globe extends React.Component {
    componentDidMount() {
        new Cesium.Viewer('globe', {
            animation: false,
            baseLayerPicker: false,
            fullscreenButton: false,
            geocoder: false,
            homeButton: false,
            infoBox: false,
            sceneModePicker: false,
            selectionIndicator: false,
            timeline: false,
            navigationHelpButton: false,
            navigationInstructionsInitiallyVisible: false
        });
    }

    render() {
        return (
            <div id="globe"></div>
        )
    }
}

class GranuleList extends React.Component {
    render() {
        return (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>ID</th>
                  <th>Summary</th>
                  <th>Granules</th>
                </tr>
              </thead>
              <tbody>
              </tbody>
            </table>
        )
    }
}

// ========================================

ReactDOM.render(
    <SpatialUI />,
    document.getElementById('everest-ui')
);
