import * as React from 'react';

import { BoundingBox } from '../BoundingBox';
import { CollectionDropdown } from './CollectionDropdown';
import { Globe } from './Globe';
import { GranuleList } from './GranuleList';

interface EverestState {
    selectedCollection: string;
    boundingBox: BoundingBox;
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
        }
    }

    handleCollectionChange(collection: string) {
        console.log(this);
        this.setState({selectedCollection: collection});
    }

    render() {
        return (
            <div className="everest-stuff">
              <CollectionDropdown
                  selectedCollection={this.state.selectedCollection}
                  onCollectionChange={this.handleCollectionChange} />
              <Globe/>
              <button type="button" name="Go!" placeholder="">Go!</button>
              <GranuleList
                  collectionId={this.state.selectedCollection}
                  boundingBox={this.state.boundingBox}/>
            </div>
        );
    }

    collectionSelected() {
        console.log('collection selected');
    }
}
