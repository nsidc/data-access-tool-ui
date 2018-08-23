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
  whitelistOnly: boolean;
}

const WHITELIST = List([
  "MOD10_L2",
  "MYD10_L2",
  "NSIDC-0642",
  "NSIDC-0724",
  "SPL2SMP",
]);

export class CollectionDropdown extends React.Component<ICollectionDropdownProps, ICollectionDropdownState> {
  public constructor(props: ICollectionDropdownProps) {
    super(props);

    this.state = {
      collections: List<CmrCollection>(),
      whitelistOnly: true,
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
    const stateChanged = hasChanged(this.state, nextState, ["collections", "whitelistOnly"]);

    return propsChanged || stateChanged;
  }

  public render() {
    const collections = this.state.whitelistOnly ?
                        this.state.collections.filter((c: any) => WHITELIST.includes(c.short_name)) :
                        this.state.collections;

    const sortedCollections = collections.sortBy((c: CmrCollection = new CmrCollection()) => c.short_name);
    const collectionOptions = sortedCollections.map((c: CmrCollection = new CmrCollection(), key?: number) => (
      <option key={key} value={JSON.stringify(c.toJS())}>({c.short_name}) {c.dataset_id}</option>
    ));

    return (
      <div id="collection-dropdown">
        <div>
          Include datasets:

          <br />

          <label>
            <input type="radio"
                   value="whitelist"
                   checked={this.state.whitelistOnly}
                   onChange={this.handleIncludeChange} />
            Whitelisted
          </label>

          <br />

          <label>
            <input type="radio"
                   value="all"
                   checked={!this.state.whitelistOnly}
                   onChange={this.handleIncludeChange} />
            All
          </label>
        </div>

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

  private handleIncludeChange = (e: any) => {
    this.setState({
      whitelistOnly: e.target.value === "whitelist",
    });
  }
}
