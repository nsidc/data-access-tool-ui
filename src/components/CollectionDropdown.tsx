import { List, Map } from "immutable";
import * as React from "react";

import { CmrCollection } from "../types/CmrCollection";
import { collectionsRequest } from "../utils/CMR";
import { IEnvironment } from "../utils/environment";

interface ICollectionDropdownProps {
  cmrStatusOk: boolean;
  environment: IEnvironment;
  selectedCollection: any;
  onCmrRequestFailure: (response: any) => any;
  onCollectionChange: any;
}

interface ICollectionDropdownState {
  collections: List<any>;
}

export class CollectionDropdown extends React.Component<ICollectionDropdownProps, ICollectionDropdownState> {
  public constructor(props: ICollectionDropdownProps) {
    super(props);

    this.state = {
      collections: List(),
    };
  }

  public componentDidMount() {
    if (this.props.cmrStatusOk) {
      this.getCmrCollections();
    }
  }

  public componentDidUpdate(prevProps: ICollectionDropdownProps) {
    if ((!prevProps.cmrStatusOk) && this.props.cmrStatusOk) {
      this.getCmrCollections();
    }
  }

  public shouldComponentUpdate(nextProps: ICollectionDropdownProps, nextState: ICollectionDropdownState) {
    const compareMap = (props: ICollectionDropdownProps,
                        state: ICollectionDropdownState) => Map({
                          cmrStatusOk: props.cmrStatusOk,
                          collections: state.collections,
                          selectedCollection: props.selectedCollection,
                        });

    return !compareMap(this.props, this.state).equals(compareMap(nextProps, nextState));
  }

  public render() {
    const sortedCollections = this.state.collections.sortBy((collection: any) => collection.dataset_id);
    const collectionOptions = sortedCollections.map((collection: any, key?: number) => (
      <option key={key} value={JSON.stringify(collection.toJS())}>{collection.dataset_id}</option>
    ));

    const value = JSON.stringify(this.props.selectedCollection.toJS());

    return (
      <div id="collection-dropdown">
        <select className="dropdown" name="collections" onChange={this.handleChange} value={value}>
          <option>{"Select a collection."}</option>
          {collectionOptions}
        </select>
      </div>
    );
  }

  private getCmrCollections() {
    const onSuccess = (response: any) => {
      this.setState({
        collections: List(response.feed.entry.map((e: any) => new CmrCollection(e))),
      }, this.selectDefaultCmrCollection);
    };

    collectionsRequest().then(onSuccess, this.props.onCmrRequestFailure);
  }

  private selectDefaultCmrCollection = () => {
    if (!this.props.environment.inDrupal || !this.props.cmrStatusOk) {
      return;
    }

    const matchingCmrCollections = this.state.collections.filter((collection: CmrCollection) => {
      return this.cmrCollectionMatchesDrupalDataset(collection, this.props.environment.drupalDataset);
    });
    if (matchingCmrCollections.size === 0) {
      console.warn("No CMR collections found for the given Drupal dataset.");
      return;
    }

    if (matchingCmrCollections.size > 1) {
      console.warn(`More than one CMR collection found for the given Drupal dataset (will use the first): ` +
                   `${matchingCmrCollections.map((collection: CmrCollection) => collection.short_name)}`);
    }

    this.props.onCollectionChange(matchingCmrCollections.get(0));
  }

  private cmrCollectionMatchesDrupalDataset = (cmrCollection: CmrCollection, drupalDataset: any): boolean => {
    if ((!cmrCollection) || (!drupalDataset)) {
      return false;
    }

    const cmrCollectionMap = Map({
      short_name: cmrCollection.short_name,
      version_id: cmrCollection.version_id,
    });

    const drupalDatasetMap = Map({
      short_name: drupalDataset.id,
      version_id: drupalDataset.version,
    });

    return cmrCollectionMap.equals(drupalDatasetMap);
  }

  private handleChange = (e: any) => {
    const collection: any = new CmrCollection(JSON.parse(e.target.value));
    this.props.onCollectionChange(collection);
  }
}
