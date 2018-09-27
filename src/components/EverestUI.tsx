import { fromJS, List } from "immutable";
import * as moment from "moment";
import * as React from "react";

import { CmrCollection, ICmrCollection } from "../types/CmrCollection";
import { CmrGranule, ICmrGranule } from "../types/CmrGranule";
import { IDrupalDataset } from "../types/DrupalDataset";
import { IOrderParameters, OrderParameters } from "../types/OrderParameters";
import { OrderSubmissionParameters } from "../types/OrderSubmissionParameters";
import { cmrCollectionRequest, cmrGranuleRequest, cmrStatusRequest } from "../utils/CMR";
import { CMR_COUNT_HEADER_NAME, cmrBoxArrToSpatialSelection } from "../utils/CMR";
import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { mergeOrderParameters } from "../utils/orderParameters";
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

interface IEverestState {
  cmrGranuleCount?: number;
  cmrGranuleResponse: List<CmrGranule>;
  cmrLoading: boolean;
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
    let orderParameters = this.initialOrderParametersFromLocalStorage();

    if (orderParameters === null) {
      orderParameters = new OrderParameters();
    } else {
      loadedParamsFromLocalStorage = true;
    }

    this.state = {
      cmrGranuleCount: undefined,
      cmrGranuleResponse: List<CmrGranule>(),
      cmrLoading: false,
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
      this.handleOrderParameterChange({}, this.enableStateFreezing);

    } else if (this.props.environment.inDrupal && this.props.environment.drupalDataset) {
      this.initStateFromCollectionDefaults(this.props.environment.drupalDataset);

    }
  }

  public shouldComponentUpdate(nextProps: IEverestProps, nextState: IEverestState) {
    const propsChanged = hasChanged(this.props, nextProps, ["environment"]);
    const stateChanged = hasChanged(this.state, nextState, [
      "cmrGranuleResponse",
      "cmrLoading",
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
              cmrGranuleResponse={this.state.cmrGranuleResponse}
              loading={this.state.cmrLoading}
              orderParameters={this.state.orderParameters} />
            <OrderButtons
              environment={this.props.environment}
              orderSubmissionParameters={this.state.orderSubmissionParameters}
              cmrGranuleResponse={this.state.cmrGranuleResponse} />
          </div>
        </div>
      </div>
    );
  }

  private updateGranulesFromCmr = () => {
    if (this.state.cmrStatusChecked && !this.state.cmrStatusOk) {
      return;
    }
    if (this.state.orderParameters.collection
        && this.state.orderParameters.collection.id
        && this.state.orderParameters.temporalFilterLowerBound
        && this.state.orderParameters.temporalFilterUpperBound) {
      this.handleCmrGranuleRequest();
    } else {
      console.warn("EverestUI.updateGranulesFromCmr: Insufficient props provided.");
    }
  }

  private handleCmrGranuleRequest = () => {
    this.setState({cmrLoading: true});
    return cmrGranuleRequest(
      this.state.orderParameters.collection.short_name,
      Number(this.state.orderParameters.collection.version_id),
      this.state.orderParameters.spatialSelection,
      this.state.orderParameters.collectionSpatialCoverage,
      this.state.orderParameters.temporalFilterLowerBound,
      this.state.orderParameters.temporalFilterUpperBound,
    ).then(this.handleCmrGranuleResponse, this.onCmrRequestFailure)
     .then(this.handleCmrGranuleResponseJSON)
     .finally(() => this.setState({cmrLoading: false}));
  }

  private handleOrderParameterChange = (newOrderParameters: Partial<IOrderParameters>, callback?: () => void) => {
    const orderParameters = mergeOrderParameters(this.state.orderParameters, newOrderParameters);

    const modifiedCallback = (): void => {
      if (this.state.stateCanBeFrozen) {
        this.freezeState();
      }
      this.updateGranulesFromCmr();
      if (callback) {
        callback();
      }
    };
    this.setState({orderParameters}, modifiedCallback);
  }

  private handleCmrGranuleResponse = (response: Response) => {
    const cmrGranuleCount: number = Number(response.headers.get(CMR_COUNT_HEADER_NAME));
    this.setState({cmrGranuleCount});
    return response.json();
  }

  private handleCmrGranuleResponseJSON = (json: any) => {
    const cmrGranuleResponse = fromJS(json.feed.entry).map((e: ICmrGranule) => new CmrGranule(e));

    const granuleURs = cmrGranuleResponse.map((g: CmrGranule) => g.title);
    const collectionIDs = cmrGranuleResponse.map((g: CmrGranule) => g.dataset_id);
    const collectionLinks = cmrGranuleResponse.map((g: CmrGranule) => g.links.last().get("href"));
    const collectionInfo = collectionIDs.map((id: string, key: number) => List([id, collectionLinks.get(key)]));
    const orderSubmissionParameters = new OrderSubmissionParameters({collectionInfo, granuleURs});

    this.setState({cmrGranuleResponse, orderSubmissionParameters});
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
  private initialOrderParametersFromLocalStorage = (): OrderParameters | null => {
    if (!this.props.environment.inDrupal) { return null; }
    if (!this.props.environment.drupalDataset) { return null; }

    const localStorageOrderParams: string | null = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!localStorageOrderParams) { return null; }

    const orderParams: any = JSON.parse(localStorageOrderParams);

    const currentDatasetMatchesSaved = this.props.environment.drupalDataset.id === orderParams.collection.short_name;
    if (!currentDatasetMatchesSaved) {
      console.warn(`Found order parameters for ${orderParams.collection.short_name} `
                 + `instead of ${this.props.environment.drupalDataset.id}; clearing `
                 + "previous state from localStorage.");
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
