import * as React from "react";

import { collectionsRequest } from "../utils/CMR";

declare var Drupal: any;

interface ICollectionDropdownProps {
  selectedCollection: any;
  onCollectionChange: any;
}

interface ICollectionDropdownState {
  collections: any;
}

export class CollectionDropdown extends React.Component<ICollectionDropdownProps, ICollectionDropdownState> {
  public constructor(props: ICollectionDropdownProps) {
    super(props);

    this.state = {
      collections: [{}],
    };
  }

  public componentDidMount() {
    collectionsRequest().then((response) => {
      this.setState({
        collections: response.feed.entry,
      }, this.selectDefaultCmrCollection);
    });
  }

  public render() {
    let collectionOptions = null;
    if (this.state.collections) {
      collectionOptions = this.state.collections.map((c: any, i: number) => (
        <option key={i} value={JSON.stringify(c)}>{c.dataset_id}</option>
      ));
    }

    const value = JSON.stringify(this.props.selectedCollection);

    return (
      <div id="collection-dropdown">
        <select className="dropdown" name="collections" onChange={this.handleChange} value={value}>
          <option>{"Select a collection."}</option>
          {collectionOptions}
        </select>
      </div>
    );
  }

  private selectDefaultCmrCollection = () => {
    if (typeof(Drupal) === "undefined") {
      return;
    }

    const drupalDataset = Drupal.settings.data_downloads.dataset;

    const matchingCmrCollections = this.state.collections.filter((c: any) => {
      return this.cmrCollectionMatchesDataset(c, drupalDataset);
    });
    if (matchingCmrCollections.length === 0) {
      console.warn("No CMR collections found for the given Drupal dataset.");
      return;
    }

    if (matchingCmrCollections.length > 1) {
      console.warn(`More than one CMR collection found for the given Drupal dataset (will use the first): ` +
                   `${matchingCmrCollections.map((c: any) => c.short_name)}`);
    }

    const collection = matchingCmrCollections[0];
    this.props.onCollectionChange(collection);
  }

  private cmrCollectionMatchesDataset = (collection: any, dataset: any): boolean => {
    if ((!collection) || (!dataset)) {
      return false;
    }

    const match = [
      collection.short_name === dataset.id,
      collection.version_id === dataset.version,
    ].every((e) => e === true);

    return match;
  }

  private handleChange = (e: any) => {
    const collection: any = JSON.parse(e.target.value);
    this.props.onCollectionChange(collection);
  }
}
