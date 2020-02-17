import { List } from "immutable";
import * as React from "react";

import { CmrCollection } from "../types/CmrCollection";
import { cmrEcsCollectionsRequest } from "../utils/CMR";
import { hasChanged } from "../utils/hasChanged";

interface ICollectionDropdownProps {
  cmrStatusOk: boolean;
  onCmrRequestFailure: (response: any) => any;
  onCollectionChange: any;
}

interface ICollectionDropdownState {
  collections: List<CmrCollection>;
  selectedCollection: string | null;
  whitelistOnly: boolean;
}

const WHITELIST = List([
  "MOD10A2",
  "MOD10_L2",
  "MYD10A2",
  "MYD10_L2",
  "NISE",
  "NSIDC-0478",
  "NSIDC-0630",
  "NSIDC-0642",
  "NSIDC-0724",
  "SPL2SMP",
]);

export class CollectionDropdown extends React.Component<ICollectionDropdownProps, ICollectionDropdownState> {
  public constructor(props: ICollectionDropdownProps) {
    super(props);

    this.state = {
      collections: List<CmrCollection>(),
      selectedCollection: null,
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

    const sortedCollections = collections.sortBy((c: CmrCollection = new CmrCollection()) => {
      return `${c.short_name} ${c.version_id.replace(/^0+/, "")}`;
    });
    const collectionOptions = sortedCollections.map((c: CmrCollection = new CmrCollection(), key?: number) => {
      const label = `(${c.short_name} v${c.version_id.replace(/^0+/, "")}) ${c.dataset_id}`;

      const value = JSON.stringify(c.toJS());

      return (
        <option key={key} value={value}>{label}</option>
      );
    });

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

        <select className="dropdown" name="collections" onChange={this.handleChange} defaultValue={""}>
          <option value="" disabled={true}>
            {"Select a collection."}
          </option>
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

    cmrEcsCollectionsRequest().then(onSuccess, this.props.onCmrRequestFailure);
  }

  private handleChange = (e: any) => {
    const collection = new CmrCollection(JSON.parse(e.target.value));
    this.setState({selectedCollection: e.target.value});
    this.props.onCollectionChange(collection);
  }

  private handleIncludeChange = (e: any) => {
    this.setState({
      whitelistOnly: e.target.value === "whitelist",
    });
  }
}
