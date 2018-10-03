import { fromJS, List, Map } from "immutable";
import * as moment from "moment";
import * as React from "react";

import { CmrCollection, ICmrCollection } from "../types/CmrCollection";
import { CmrGranule } from "../types/CmrGranule";
import { IDrupalDataset } from "../types/DrupalDataset";
import { IOrderParameters, OrderParameters } from "../types/OrderParameters";
import { OrderSubmissionParameters } from "../types/OrderSubmissionParameters";
import { cmrCollectionRequest, cmrGranuleRequest, cmrStatusRequest } from "../utils/CMR";
import { CMR_COUNT_HEADER, CMR_SCROLL_HEADER, cmrBoxArrToSpatialSelection } from "../utils/CMR";
import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { mergeOrderParameters } from "../utils/orderParameters";
import { updateStateAddGranules } from "../utils/state";
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
  cmrGranuleScrollId?: string;
  cmrGranules: List<CmrGranule>;
  cmrLoading: boolean;
  cmrLoadingNextPage: boolean;
  cmrStatusChecked: boolean;
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
    let orderParameters = this.initializeOrderParametersFromLocalStorage();

    if (orderParameters === null) {
      orderParameters = new OrderParameters();
    } else {
      loadedParamsFromLocalStorage = true;
    }

    this.state = {
      cmrGranuleCount: undefined,
      cmrGranuleScrollId: undefined,
      cmrGranules: List<CmrGranule>(),
      cmrLoading: false,
      cmrLoadingNextPage: false,
      cmrStatusChecked: false,
      cmrStatusOk: false,
      loadedParamsFromLocalStorage,
      orderParameters,
      orderSubmissionParameters: undefined,
      stateCanBeFrozen: false,
    };
  }

  public componentDidMount() {
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

    if (this.state.loadedParamsFromLocalStorage) {
      this.updateGranulesFromCmr();
      this.enableStateFreezing();

    } else if (this.props.environment.inDrupal && this.props.environment.drupalDataset) {
      this.initStateFromCollectionDefaults(this.props.environment.drupalDataset);

    }
  }

  public shouldComponentUpdate(nextProps: IEverestProps, nextState: IEverestState) {
    const propsChanged = hasChanged(this.props, nextProps, ["environment"]);
    const stateChanged = hasChanged(this.state, nextState, [
      "cmrGranules",
      "cmrLoading",
      "cmrLoadingNextPage",
      "cmrStatusChecked",
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
        <div id="cmr-status">
          <CmrDownBanner
            cmrStatusChecked={this.state.cmrStatusChecked}
            cmrStatusOk={this.state.cmrStatusOk}
          />
        </div>
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
              loadNextPageOfGranules={() => this.updateGranulesFromCmr(true)}
              loading={this.state.cmrLoading}
              loadingNextPage={this.state.cmrLoadingNextPage}
              orderParameters={this.state.orderParameters} />
            <OrderButtons
              environment={this.props.environment}
              orderSubmissionParameters={this.state.orderSubmissionParameters}
              cmrGranules={this.state.cmrGranules} />
          </div>
        </div>
      </div>
    );
  }

  private updateGranulesFromCmr = (nextPage: boolean = false) => {
    if (this.state.stateCanBeFrozen) {
      this.freezeState();
    }

    if (this.state.cmrStatusChecked && !this.state.cmrStatusOk) {
      return;
    }
    if (this.state.orderParameters.collection
        && this.state.orderParameters.collection.id
        && this.state.orderParameters.temporalFilterLowerBound
        && this.state.orderParameters.temporalFilterUpperBound) {
      this.handleCmrGranuleRequest(nextPage);
    } else {
      console.warn("EverestUI.updateGranulesFromCmr: Insufficient props provided.");
    }
  }

  private handleCmrGranuleRequest = (nextPage: boolean = false) => {
    this.setState({cmrLoading: !nextPage, cmrLoadingNextPage: true});

    let headers = Map<string, string>();
    if (this.state.cmrGranuleScrollId) {
      headers = Map([[CMR_SCROLL_HEADER, this.state.cmrGranuleScrollId]]);
    }

    return cmrGranuleRequest(
      this.state.orderParameters.collection.short_name,
      Number(this.state.orderParameters.collection.version_id),
      this.state.orderParameters.spatialSelection,
      this.state.orderParameters.collectionSpatialCoverage,
      this.state.orderParameters.temporalFilterLowerBound,
      this.state.orderParameters.temporalFilterUpperBound,
      headers,
    ).then(this.handleCmrGranuleResponse, this.onCmrRequestFailure)
     .then(this.handleCmrGranuleResponseJSON)
     .finally(() => this.setState({cmrLoading: false, cmrLoadingNextPage: false}));
  }

  private handleOrderParameterChange = (newOrderParameters: Partial<IOrderParameters>) => {
    const orderParameters = mergeOrderParameters(this.state.orderParameters, newOrderParameters);

    const state = {
      orderParameters,

      // clear existing results
      cmrGranuleScrollId: undefined,
      cmrGranules: List<CmrGranule>(),
    };

    this.setState(state, this.updateGranulesFromCmr);
  }

  private handleCmrGranuleResponse = (response: Response) => {
    const cmrGranuleCount: number = Number(response.headers.get(CMR_COUNT_HEADER));
    const cmrGranuleScrollId: string = String(response.headers.get(CMR_SCROLL_HEADER));

    if (this.state.cmrGranuleScrollId && (cmrGranuleScrollId !== this.state.cmrGranuleScrollId)) {
      throw new Error(`Had CMR-Scroll-Id "${this.state.cmrGranuleScrollId}", but got back ${cmrGranuleScrollId}`);
    }

    this.setState({cmrGranuleCount, cmrGranuleScrollId });
    return response.json();
  }

  private handleCmrGranuleResponseJSON = (json: any) => {
    this.setState(updateStateAddGranules(json.feed.entry));
  }

  private onCmrRequestFailure = (response: any) => {
    this.setState({cmrStatusChecked: true, cmrStatusOk: false});
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

  // returns an OrderParameters object built using values saved in localStorage,
  // or null
  private initializeOrderParametersFromLocalStorage = (): OrderParameters | null => {
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
