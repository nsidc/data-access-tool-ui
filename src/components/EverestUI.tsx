import * as React from 'react';

import { CollectionDropdown } from './CollectionDropdown';
import { Globe } from './Globe';
import { GranuleList } from './GranuleList';

interface EverestState {
    selectedCollection: string;
    boundingBox: any;
}

export class EverestUI extends React.Component<{}, EverestState> {
    static displayName = "EverestUI";

    constructor(props: any) {
        super(props);
        this.state = {
            selectedCollection: "",
            boundingBox: [],
        }
    }

    handleCollectionChange(collection: string) {
        console.log(this);
        this.setState({"selectedCollection": collection});
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
