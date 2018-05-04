import * as React from "react";

const CMR_COLLECTION_URL = "https://cmr.earthdata.nasa.gov/search/collections.json?page_size=500&provider=NSIDC_ECS&sort_key=short_name";

interface CollectionsState {
    collections: any;
}

interface CollectionsProps {
    selectedCollection: any;
    onCollectionChange: any;
}

class Component extends React.Component<CollectionsProps, CollectionsState> {
    static displayName = "CollectionDropdown";

    constructor(props: any) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            collections: null
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
            collectionOptions = this.state.collections.map((c: any) => {
              return (
                <option key={c.id} value={c.id}>{c.dataset_id}</option>
            );
          });
        }

        return (
            <select className="dropdown" name="collections" onChange={this.handleChange}>
              <option value="">{"Select a collection."}</option>
              {collectionOptions}
            </select>
        );
    }
}

export default Component;
