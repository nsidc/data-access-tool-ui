import { fromJS, List } from "immutable";
import * as moment from "moment";
import * as React from "react";

import { CmrCollection, ICmrCollection } from "../types/CmrCollection";
import { CmrGranule } from "../types/CmrGranule";
import { IDrupalDataset } from "../types/DrupalDataset";
import { IOrderParameters, OrderParameters } from "../types/OrderParameters";
import { OrderSubmissionParameters } from "../types/OrderSubmissionParameters";
import { CMR_COUNT_HEADER, CMR_MAX_GRANULES, CMR_SCROLL_HEADER,
         cmrBoxArrToSpatialSelection, cmrCollectionRequest, cmrGranuleScrollInitRequest,
         cmrGranuleScrollNextRequest, cmrStatusRequest } from "../utils/CMR";
import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { mergeOrderParameters } from "../utils/orderParameters";
import { updateStateAddGranules, updateStateInitGranules } from "../utils/state";
import { CmrDownBanner } from "./CmrDownBanner";
import { CollectionDropdown } from "./CollectionDropdown";
import { GranuleList } from "./GranuleList";
import { OrderButtons } from "./OrderButtons";
import { OrderParameterInputs } from "./OrderParameterInputs";

const __DEV__ = false;  // set to true to test CMR failure case in development

const LOCAL_STORAGE_KEY = "nsidcDataOrderParams";

interface IEverestProps {
  environment: IEnvironment;
}

export interface IEverestState {
  cmrGranuleCount?: number;
  cmrGranuleScrollDepleted: boolean;
  cmrGranuleScrollId?: string;
  cmrGranules: List<CmrGranule>;
  cmrLoadingGranuleInit: boolean;
  cmrLoadingGranuleScroll: boolean;
  cmrStatusChecked: boolean;
  cmrStatusMessage: string;
  cmrStatusOk: boolean;
  loadedParamsFromLocalStorage: boolean;
  orderParameters: OrderParameters;
  orderSubmissionParameters?: OrderSubmissionParameters;
  stateCanBeFrozen: boolean;
}

export class EverestUI extends React.Component<IEverestProps, IEverestState> {
  public constructor(props: any) {
    super(props);

    let loadedParamsFromLocalStorage = false;
    let orderParameters = this.extractOrderParametersFromLocalStorage();

    if (orderParameters === null) {
      orderParameters = new OrderParameters();
    } else {
      loadedParamsFromLocalStorage = true;
    }

    this.state = {
      cmrGranuleCount: undefined,
      cmrGranuleScrollDepleted: false,
      cmrGranuleScrollId: undefined,
      cmrGranules: List<CmrGranule>(),
      cmrLoadingGranuleInit: false,
      cmrLoadingGranuleScroll: false,
      cmrStatusChecked: false,
      cmrStatusMessage: "Error: Unknown request",
      cmrStatusOk: false,
      loadedParamsFromLocalStorage,
      orderParameters,
      orderSubmissionParameters: undefined,
      stateCanBeFrozen: false,
    };

    // allow easy testing of CMR errors by creating functions that can be called
    // from the console in a browser's dev tools to simulate and cleanup CMR errors
    props.environment.exposeFunction("CmrError", () => {
      this.setState({cmrStatusChecked: true, cmrStatusOk: false});
    });
    props.environment.exposeFunction("CmrReset", () => {
      this.setState({cmrStatusChecked: false, cmrStatusOk: false}, this.cmrStatusRequestUntilOK);
    });
  }

  public CmrReset() {
    this.setState({ cmrStatusChecked: false, cmrStatusOk: false }, this.cmrStatusRequestUntilOK);
  }

  public componentDidMount() {
    if (!this.state.cmrStatusChecked) {
      this.cmrStatusRequestUntilOK();
    }

    if (this.state.loadedParamsFromLocalStorage) {
      this.startCmrGranuleScroll();
      this.enableStateFreezing();

    } else if (this.props.environment.inDrupal && this.props.environment.drupalDataset) {
      this.initStateFromCollectionDefaults(this.props.environment.drupalDataset);

    }
  }

  public shouldComponentUpdate(nextProps: IEverestProps, nextState: IEverestState) {
    const propsChanged = hasChanged(this.props, nextProps, ["environment"]);
    const stateChanged = hasChanged(this.state, nextState, [
      "cmrGranules",
      "cmrGranuleCount",
      "cmrLoadingGranuleInit",
      "cmrLoadingGranuleScroll",
      "cmrStatusChecked",
      "cmrStatusMessage",
      "cmrStatusOk",
      "orderParameters",
      "orderSubmissionParameters",
    ]);

    return propsChanged || stateChanged;
  }

  public render() {
    let collectionDropdown = null;
    if (!this.props.environment.inDrupal) {
      collectionDropdown = (
        <CollectionDropdown
          onCmrRequestFailure={this.onCmrRequestFailure}
          cmrStatusOk={this.state.cmrStatusOk}
          onCollectionChange={this.handleCollectionChange} />
      );
    }
    return (
      <div id="everest-container">
        <CmrDownBanner
          cmrStatusChecked={this.state.cmrStatusChecked}
          cmrStatusOk={this.state.cmrStatusOk}
          cmrStatusMessage={this.state.cmrStatusMessage}
          onChange={() => { this.CmrReset(); }}
        />
        <div id="collection-list">
          {collectionDropdown}
        </div>
        <div id="columns">
          <div id="left-side">
            <OrderParameterInputs
              cmrStatusOk={this.state.cmrStatusOk}
              environment={this.props.environment}
              onChange={this.handleOrderParameterChange}
              orderParameters={this.state.orderParameters} />
          </div>
          <div id="right-side">
            <GranuleList
              cmrGranuleCount={this.state.cmrGranuleCount}
              cmrGranules={this.state.cmrGranules}
              loadNextPageOfGranules={this.advanceCmrGranuleScroll}
              cmrLoadingGranuleInit={this.state.cmrLoadingGranuleInit}
              cmrLoadingGranuleScroll={this.state.cmrLoadingGranuleScroll}
              orderParameters={this.state.orderParameters} />
            <OrderButtons
              cmrGranuleCount={this.state.cmrGranuleCount}
              ensureGranuleScrollDepleted={this.advanceCmrGranuleScrollToEnd}
              environment={this.props.environment}
              orderSubmissionParameters={this.state.orderSubmissionParameters}
              cmrGranules={this.state.cmrGranules} />
          </div>
        </div>
      </div>
    );
  }

  private cmrStatusRequestUntilOK = () => {
    const onSuccess = (response: any) => {
      this.setState({cmrStatusChecked: true, cmrStatusOk: true});
    };

    const onFailure = (response: any) => {
      this.onCmrRequestFailure(response);

      // retry periodically so that the app comes back to life when CMR is back
      const delayMilliseconds = 1000 * (__DEV__ ? 5 : 60);
      setTimeout(() => {
        cmrStatusRequest().then(onSuccess, onFailure);
      }, delayMilliseconds);
    };

    cmrStatusRequest().then(onSuccess, onFailure);
  }

  private canScroll = () => {
    return this.state.cmrGranules.size < CMR_MAX_GRANULES
      && !this.state.cmrGranuleScrollDepleted;
  }

  private startCmrGranuleScroll = () => {
    if (this.state.stateCanBeFrozen) {
      this.freezeState();
    }

    if (this.state.cmrStatusChecked && !this.state.cmrStatusOk) {
      return;
    }

    const orderInputPopulated = this.state.orderParameters.collection
                                && this.state.orderParameters.collection.id
                                && this.state.orderParameters.temporalFilterLowerBound
                                && this.state.orderParameters.temporalFilterUpperBound;
    if (orderInputPopulated) {
      this.setState({cmrLoadingGranuleInit: true}, this.handleCmrGranuleInitRequest);
    } else {
      console.warn("EverestUI.startCmrGranuleScroll: Insufficient props provided.");
    }
  }

  private advanceCmrGranuleScroll = () => {
    if (!this.canScroll()) { return; }

    if (this.state.cmrGranules.isEmpty() || !this.state.cmrGranuleScrollId) {
      throw new Error("Can't scroll without an initial granule response or a scroll ID.");
    }

    if (this.state.stateCanBeFrozen) {
      this.freezeState();
    }

    this.setState(
      {cmrLoadingGranuleScroll: true},
      () => this.handleCmrGranuleScrollRequest(this.state.cmrGranuleScrollId!),
    );
  }

  private advanceCmrGranuleScrollToEnd = (callback?: () => any): Promise<any> => {
    return this.handleCmrGranuleScrollRequest(this.state.cmrGranuleScrollId!)
      .then((): Promise<any> => {
        if (!this.canScroll()) {
          return Promise.resolve();
        }

        // Recurse within the promise without a callback. The callback from the
        // initial call will be called at the end of the recursive calls.
        return this.advanceCmrGranuleScrollToEnd();
      })
      .then(() => {
        if (callback) {
          return callback();
        }
      });
  }

  private handleCmrGranuleInitRequest = () => {
    return cmrGranuleScrollInitRequest(
      this.state.orderParameters.collection.short_name,
      Number(this.state.orderParameters.collection.version_id),
      this.state.orderParameters.spatialSelection,
      this.state.orderParameters.collectionSpatialCoverage,
      this.state.orderParameters.temporalFilterLowerBound,
      this.state.orderParameters.temporalFilterUpperBound,
    ).then(this.handleCmrGranuleResponse, this.onCmrRequestFailure)
     .then(this.handleCmrGranuleResponseJSON)
     .catch((err) => { err = null; })
     .finally(() => this.setState({cmrLoadingGranuleInit: false}));
  }

  private handleCmrGranuleScrollRequest = (cmrGranuleScrollId: string) => {
    return cmrGranuleScrollNextRequest(cmrGranuleScrollId)
      .then(this.handleCmrGranuleScrollResponse, this.onCmrRequestFailure)
      .then(this.handleCmrGranuleScrollResponseJSON)
      .finally(() => this.setState({cmrLoadingGranuleScroll: false}));
  }

  private handleCmrGranuleResponse = (response: Response) => {
    const cmrGranuleCount: number = Number(response.headers.get(CMR_COUNT_HEADER));
    const cmrGranuleScrollId: string = String(response.headers.get(CMR_SCROLL_HEADER));

    this.setState({cmrGranuleCount, cmrGranuleScrollDepleted: false, cmrGranuleScrollId });
    return response.json();
  }

  private handleCmrGranuleResponseJSON = (json: any) => {
    this.setState(updateStateInitGranules(json.feed.entry));
  }

  private handleCmrGranuleScrollResponse = (response: Response) => {
    const cmrGranuleScrollId: string = String(response.headers.get(CMR_SCROLL_HEADER));

    if (this.state.cmrGranuleScrollId && (cmrGranuleScrollId !== this.state.cmrGranuleScrollId)) {
      throw new Error(`Had CMR-Scroll-Id "${this.state.cmrGranuleScrollId}", but got back ${cmrGranuleScrollId}`);
    }

    return response.json();
  }

  private handleCmrGranuleScrollResponseJSON = (json: any) => {
    if (json.feed.entry.length === 0) {
      this.setState({cmrGranuleScrollDepleted: true});
      return;
    }

    this.setState(updateStateAddGranules(json.feed.entry));
  }

  private onCmrRequestFailure = (response: any) => {
    response.json().then((json: any) => {
      let msg = "Error: " + json.errors[0];
      if (msg.length > 300) {
        msg = msg.substr(0, 300) + "...";
      }
      this.setState({ cmrStatusChecked: true, cmrStatusMessage: msg, cmrStatusOk: false });
    });
    return Promise.reject(response);
  }

  private handleOrderParameterChange = (newOrderParameters: Partial<IOrderParameters>) => {
    const orderParameters = mergeOrderParameters(this.state.orderParameters, newOrderParameters);

    const state = {
      orderParameters,

      // clear existing results
      cmrGranuleScrollId: undefined,
      cmrGranules: List<CmrGranule>(),
    };

    this.setState(state, this.startCmrGranuleScroll);
  }

  private handleCollectionChange = (collection: any) => {
    const boundingBoxes = collection.boxes;
    const collectionSpatialCoverage = cmrBoxArrToSpatialSelection(boundingBoxes);

    this.handleOrderParameterChange({
      collection,
      collectionSpatialCoverage,
      temporalFilterLowerBound: moment(collection.time_start),
      temporalFilterUpperBound: collection.time_end ? moment(collection.time_end) : moment(),
    });
  }

  private handleCmrCollectionResponse = (response: any) => {
    const cmrCollections = fromJS(response.feed.entry).map((c: ICmrCollection) => new CmrCollection(c));

    if (cmrCollections.size > 1) {
      console.warn("Multiple collections matched, using first: " + cmrCollections.toJS());
    } else if (cmrCollections.size === 0) {
      console.warn("No collections matched: " + this.props.environment.drupalDataset);
    }

    const collection = cmrCollections.first();
    const collectionSpatialCoverage = cmrBoxArrToSpatialSelection(collection.boxes);
    this.handleOrderParameterChange({
      collection,
      collectionSpatialCoverage,
      temporalFilterLowerBound: moment(collection.time_start),
      temporalFilterUpperBound: collection.time_end ? moment(collection.time_end) : moment(),
    });
  }

  private extractOrderParametersFromLocalStorage = (): OrderParameters | null => {
    if (!this.props.environment.inDrupal) { return null; }

    const localStorageOrderParams: string | null = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!localStorageOrderParams) { return null; }

    const orderParams: any = JSON.parse(localStorageOrderParams);

    const currentDatasetMatchesSaved = this.props.environment.drupalDataset!.id === orderParams.collection.short_name;
    if (!currentDatasetMatchesSaved) {
      this.clearLocalStorage();
      return null;
    }

    orderParams.temporalFilterLowerBound = moment(orderParams.temporalFilterLowerBound);
    orderParams.temporalFilterUpperBound = moment(orderParams.temporalFilterUpperBound);
    const orderParameters: OrderParameters = new OrderParameters(...orderParams);

    console.warn("Order parameters loaded from previous state.");

    return orderParameters;
  }

  private initStateFromCollectionDefaults = (selectedCollection: IDrupalDataset) => {
    const datasetId: string = selectedCollection.id;
    const datasetVersion: number = Number(selectedCollection.version);
    cmrCollectionRequest(datasetId, datasetVersion)
      .then(this.handleCmrCollectionResponse, this.onCmrRequestFailure)
      .then(this.enableStateFreezing);
  }

  private freezeState = () => {
    return localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.state.orderParameters));
  }

  private enableStateFreezing = () => {
    this.setState({stateCanBeFrozen: true});
  }

  private clearLocalStorage = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
}
