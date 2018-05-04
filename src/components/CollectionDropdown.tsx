import * as React from "react";

// TODO: we will want short_name and version_id
// Weird, but true: when we make the graule query we pass short_name
// and version, not version_id.
const CMR_COLLECTION_URL = "https://cmr.earthdata.nasa.gov/search/collections.json?page_size=500&provider=NSIDC_ECS&sort_key=short_name";


interface CollectionDropdownProps {
    selectedCollection: any;
    onCollectionChange: any;
}

interface CollectionDropdownState {
    collections: any;
}

export class CollectionDropdown extends React.Component<CollectionDropdownProps, CollectionDropdownState> {
    static displayName = "CollectionDropdown";

    constructor(props: any) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            collections: [{}]
        };
    }

    handleChange(e: any) {
      this.props.onCollectionChange(e.target.value);
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
            collectionOptions = this.state.collections.map((c: any) => (
                <option key={c.id} value={c.id}>{c.dataset_id}</option>
            ));
        }

        return (
            <select className="dropdown" name="collections" onChange={this.handleChange}>
              <option value="">{"Select a collection."}</option>
              {collectionOptions}
            </select>
        );
    }
}
