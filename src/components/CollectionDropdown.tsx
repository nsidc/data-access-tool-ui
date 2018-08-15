import { List } from "immutable";
import * as React from "react";

import { CmrCollection } from "../types/CmrCollection";
import { collectionsRequest } from "../utils/CMR";
import { hasChanged } from "../utils/hasChanged";

interface ICollectionDropdownProps {
  cmrStatusOk: boolean;
  onCmrRequestFailure: (response: any) => any;
  onCollectionChange: any;
}

interface ICollectionDropdownState {
  collections: List<CmrCollection>;
}

export class CollectionDropdown extends React.Component<ICollectionDropdownProps, ICollectionDropdownState> {
  public constructor(props: ICollectionDropdownProps) {
    super(props);

    this.state = {
      collections: List<CmrCollection>(),
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
    const propsChanged = hasChanged(this.props, nextProps, ["cmrStatusOk"]);
    const stateChanged = hasChanged(this.state, nextState, ["collections"]);

    return propsChanged || stateChanged;
  }

  public render() {
    const sortedCollections = this.state.collections.sortBy((c: CmrCollection= new CmrCollection()) => c.dataset_id);
    const collectionOptions = sortedCollections.map((c: CmrCollection = new CmrCollection(), key?: number) => (
      <option key={key} value={JSON.stringify(c.toJS())}>({c.short_name}) {c.dataset_id}</option>
    ));

    return (
      <div id="collection-dropdown">
        <select className="dropdown" name="collections" onChange={this.handleChange}>
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
      });
    };

    collectionsRequest().then(onSuccess, this.props.onCmrRequestFailure);
  }

  private handleChange = (e: any) => {
    const collection = new CmrCollection(JSON.parse(e.target.value));
    this.props.onCollectionChange(collection);
  }
}
