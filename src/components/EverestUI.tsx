import * as React from 'react';

import { BoundingBox } from '../BoundingBox';
import { CollectionDropdown } from './CollectionDropdown';
import { Globe } from './Globe';
import { GranuleList } from './GranuleList';


const CMR_GRANULE_URL = 'https://cmr.earthdata.nasa.gov/search/granules.json?page_size=50&provider=NSIDC_ECS&sort_key=short_name';


interface EverestState {
    selectedCollection: string;
    boundingBox: BoundingBox;
    granules: any;
}

export class EverestUI extends React.Component<{}, EverestState> {
    static displayName = "EverestUI";

    constructor(props: any) {
        super(props);
        this.state = {
            selectedCollection: "",
            boundingBox: {
                lower_left_lon: -180,
                lower_left_lat: 0,
                upper_right_lon: 180,
                upper_right_lat: 90
            },
            granules: [{}]
        };
    }

    handleCollectionChange(collection: string) {
        console.log(collection);
        this.setState({selectedCollection: collection});
    }

    getGranules() {
        console.log('Getting some delicious, nutritious granules');
        let url = CMR_GRANULE_URL + `&concept_id=${this.state.selectedCollection}`
        fetch(url)
            .then(response => response.json())
            .then(response => this.setState({
                granules: response.feed.entry
            }));
    }

    render() {
        return (
            <div className="everest-stuff">
              <CollectionDropdown
                  selectedCollection={this.state.selectedCollection}
                  onCollectionChange={this.handleCollectionChange.bind(this)} />
              <Globe/>
              <button type="button" name="Go!" onClick={this.getGranules.bind(this)}>Please Get Me Some Delicious Granules!</button>
              <GranuleList
                  collectionId={this.state.selectedCollection}
                  boundingBox={this.state.boundingBox}
                  granules={this.state.granules} />
            </div>
        );
    }

    collectionSelected() {
        console.log('collection selected');
    }
}
