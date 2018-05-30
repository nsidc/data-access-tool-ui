import { collectionsRequest } from "../CMR";

import * as React from "react";

interface ICollectionDropdownProps {
    selectedCollection: any;
    onCollectionChange: any;
}

interface ICollectionDropdownState {
    collections: any;
}

export class CollectionDropdown extends React.Component<ICollectionDropdownProps, ICollectionDropdownState> {
    public constructor(props: any) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            collections: [{}],
        };
    }

    public componentDidMount() {
      collectionsRequest().then((response) => this.setState({
        collections: response.feed.entry,
      }));
    }

    public render() {
        let collectionOptions = null;

        if (this.state.collections) {
            collectionOptions = this.state.collections.map((c: any, i: number) => (
                <option key={i} value={JSON.stringify(c)}>{c.dataset_id}</option>
            ));
        }

        return (
            <select className="dropdown" name="collections" onChange={this.handleChange}>
              <option value="">{"Select a collection."}</option>
              {collectionOptions}
            </select>
        );
    }

    private handleChange(e: any) {
      const collection: any = JSON.parse(e.target.value);
      this.props.onCollectionChange(collection);
    }
}
