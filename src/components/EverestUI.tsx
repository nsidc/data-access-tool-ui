import { fromJS, List } from "immutable";
import * as moment from "moment";
import * as React from "react";
import SplitPane from "react-split-pane";
import * as ReactTooltip from "react-tooltip";

import { BoundingBox } from "../types/BoundingBox";
import { CmrCollection, ICmrCollection } from "../types/CmrCollection";
import { CmrGranule } from "../types/CmrGranule";
import { IDrupalDataset } from "../types/DrupalDataset";
import { GranuleSorting, IOrderParameters, OrderParameters } from "../types/OrderParameters";
import { OrderSubmissionParameters } from "../types/OrderSubmissionParameters";
import { CMR_COUNT_HEADER,
         cmrBoxArrToSpatialSelection, cmrCollectionRequest, cmrGranuleRequest,
         cmrStatusRequest } from "../utils/CMR";
import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { mergeOrderParameters } from "../utils/orderParameters";
import { updateStateInitGranules } from "../utils/state";
import { CmrDownBanner } from "./CmrDownBanner";
import { CollectionDropdown } from "./CollectionDropdown";
import { GranuleList } from "./GranuleList";
import { OrderButtons } from "./OrderButtons";
import { OrderParameterInputs } from "./OrderParameterInputs";

const __DEV__ = false;  // set to true to test CMR failure case in development

const LOCAL_STORAGE_KEY = "nsidcDataOrderParams";
const LOCAL_STORAGE_UI_KEY = "nsidcLandingPageUI";

interface IEverestProps {
  environment: IEnvironment;
}

export interface IEverestState {
  cmrGranuleCount?: number;
  cmrGranules: List<CmrGranule>;
  cmrLoadingGranules: boolean;
  cmrStatusChecked: boolean;
  cmrStatusMessage: string;
  cmrStatusOk: boolean;
  loadedParamsFromLocalStorage: boolean;
  orderParameters: OrderParameters;
  orderSubmissionParameters?: OrderSubmissionParameters;
  stateCanBeFrozen: boolean;
  totalSize: number;
}

export class EverestUI extends React.Component<IEverestProps, IEverestState> {

  private resetPolygon: boolean = true;

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
      cmrGranules: List<CmrGranule>(),
      cmrLoadingGranules: false,
      cmrStatusChecked: false,
      cmrStatusMessage: "",
      cmrStatusOk: false,
      loadedParamsFromLocalStorage,
      orderParameters,
      orderSubmissionParameters: undefined,
      stateCanBeFrozen: false,
      totalSize: 0,
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
    if (this.resetPolygon) {
      this.handleOrderParameterChange({
        spatialSelection: null,
      });
    }
  }

  public componentDidMount() {
    if (!this.state.cmrStatusChecked) {
      this.cmrStatusRequestUntilOK();
    }

    if (this.state.loadedParamsFromLocalStorage) {
      this.cmrGranuleRequest();
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
      "cmrGranuleFilter",
      "cmrLoadingGranules",
      "cmrStatusChecked",
      "cmrStatusMessage",
      "cmrStatusOk",
      "orderParameters",
      "orderSubmissionParameters",
      "totalSize",
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

    let columnContainer: any;

    return (
      <div id="everest-container">
        <ReactTooltip effect="solid" delayShow={500} />
        <CmrDownBanner
          cmrStatusChecked={this.state.cmrStatusChecked}
          cmrStatusOk={this.state.cmrStatusOk}
          cmrStatusMessage={this.state.cmrStatusMessage}
          onChange={() => { this.CmrReset(); }}
        />
        <div id="collection-list">
          {collectionDropdown}
        </div>
        <div id="columns" ref={(n) => columnContainer = n}>
          <SplitPane split="vertical" minSize={300} maxSize={-600}
            defaultSize={this.getLocalStorageUIByKey("splitPosition", "50%")}
            onDragFinished={(size) => {
              let ratio = 100 * (size / columnContainer.getBoundingClientRect().width);
              ratio = Math.max(Math.min(ratio, 85), 15);
              const percentSize = String(Math.round(ratio)) + "%";
              this.setLocalStorageUIByKey("splitPosition", percentSize);
            }}
          >
            <div id="left-side">
              <OrderParameterInputs
                cmrStatusOk={this.state.cmrStatusOk}
                environment={this.props.environment}
                onChange={this.handleOrderParameterChange}
                orderParameters={this.state.orderParameters}
                onTemporalReset={this.handleTemporalReset}
                setCmrErrorMessage={this.setCmrErrorMessage}
              />
            </div>
            <div id="right-side">
              <GranuleList
                cmrGranuleCount={this.state.cmrGranuleCount}
                cmrGranuleFilter={this.state.orderParameters.cmrGranuleFilter}
                cmrGranules={this.state.cmrGranules}
                cmrLoadingGranules={this.state.cmrLoadingGranules}
                granuleSorting={this.state.orderParameters.granuleSorting}
                totalSize={this.state.totalSize}
                updateGranuleFilter={this.updateGranuleFilter}
                updateGranuleSorting={this.updateGranuleSorting}
                fireGranuleFilter={this.fireGranuleFilter} />
              <OrderButtons
                cmrGranuleCount={this.state.cmrGranuleCount}
                environment={this.props.environment}
                orderParameters={this.state.orderParameters}
                orderSubmissionParameters={this.state.orderSubmissionParameters}
                totalSize={this.state.totalSize} />
            </div>
          </SplitPane>
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

  private cmrGranuleRequest = () => {
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
      this.setState({cmrLoadingGranules: true}, this.handleCmrGranuleRequest);
    } else {
      console.warn("EverestUI.cmrGranuleRequest: Insufficient props provided.");
    }
  }

  private handleCmrGranuleRequest = () => {
    return cmrGranuleRequest(
      this.state.orderParameters.collection.short_name,
      Number(this.state.orderParameters.collection.version_id),
      this.state.orderParameters.spatialSelection,
      this.state.orderParameters.boundingBox,
      this.state.orderParameters.temporalFilterLowerBound,
      this.state.orderParameters.temporalFilterUpperBound,
      this.state.orderParameters.cmrGranuleFilter,
      this.state.orderParameters.granuleSorting,
    ).then(this.handleCmrGranuleResponse, this.onCmrRequestFailure)
     .then(this.handleCmrGranuleResponseJSON)
     .catch((err) => { err = null; })
     .finally(() => this.setState({cmrLoadingGranules: false}));
  }

  private handleCmrGranuleResponse = (response: Response) => {
    const cmrGranuleCount: number = Number(response.headers.get(CMR_COUNT_HEADER));

    this.setState({cmrGranuleCount});
    return response.json();
  }

  private handleCmrGranuleResponseJSON = (json: any) => {
    this.setState(updateStateInitGranules(json.feed.entry,
      this.state.cmrGranuleCount ? this.state.cmrGranuleCount : 0));
  }

  private setCmrErrorMessage = (msg: string) => {
    this.setState({ cmrStatusChecked: true, cmrStatusMessage: msg, cmrStatusOk: false });
  }

  private createErrorMessage = (errorMsg: string) => {
    let msg = "";
    this.resetPolygon = true;
    if (errorMsg.includes("polygon boundary intersected")) {
      msg = "Polygon lines cannot intersect. Please redraw your polygon.";
    } else {
      msg = errorMsg;
      if (msg.length > 300) {
        msg = msg.substr(0, 300) + "...";
      }
    }
    return msg;
  }

  private onCmrRequestFailure = (response: any) => {
    // Setting status to an empty string will generate the default error message.
    let msg = "";
    if (response.json) {
      response.json().then((json: any) => {
        msg = "Error: " + this.createErrorMessage(json.errors[0]);
      });
    }
    this.setCmrErrorMessage(msg);
    return Promise.reject(response);
  }

  private handleTemporalReset = () => {
    const collection = this.state.orderParameters.collection;
    this.handleOrderParameterChange({
      temporalFilterLowerBound: collection.time_start ? moment.utc(collection.time_start) : moment.utc("20100101"),
      temporalFilterUpperBound: collection.time_end ? moment.utc(collection.time_end) : moment.utc(),
    });
  }

  private updateGranuleFilter = (cmrGranuleFilter: string) => {
    const orderParameters = mergeOrderParameters(this.state.orderParameters, { cmrGranuleFilter });
    this.setState({ orderParameters });
  }

  private fireGranuleFilter = () => {
    this.handleOrderParameterChange({ cmrGranuleFilter: this.state.orderParameters.cmrGranuleFilter });
  }

  private updateGranuleSorting = (granuleSorting: GranuleSorting) => {
    this.handleOrderParameterChange({ granuleSorting });
  }

  private handleOrderParameterChange = (newOrderParameters: Partial<IOrderParameters>) => {
    let timeErrorLowerBound = "";
    let timeErrorUpperBound = "";

    let orderParameters = mergeOrderParameters(this.state.orderParameters, newOrderParameters);

    if (orderParameters.temporalFilterLowerBound >= orderParameters.temporalFilterUpperBound) {
      timeErrorLowerBound = "Start date is after the end date";
      timeErrorUpperBound = timeErrorLowerBound;
    } else {
      const collectionStart = moment.utc(orderParameters.collection.time_start);
      const collectionEnd = (orderParameters.collection.time_end) ?
        moment.utc(orderParameters.collection.time_end) : moment.utc();
      if (orderParameters.temporalFilterLowerBound < collectionStart) {
        const c = collectionStart.format("MM/DD/YYYY");
        timeErrorLowerBound = "The data set begins on " + c;
      }
      if (orderParameters.temporalFilterUpperBound > collectionEnd) {
        const c = collectionEnd.format("MM/DD/YYYY");
        timeErrorUpperBound = "The data set ends on " + c;
      }
    }

    orderParameters = mergeOrderParameters(orderParameters, { timeErrorLowerBound, timeErrorUpperBound });

    if (timeErrorLowerBound || timeErrorUpperBound) {
      this.setState({ orderParameters });
      return;
    }

    const state = {
      orderParameters,

      // clear existing results
      cmrGranules: List<CmrGranule>(),
    };

    this.setState(state, this.cmrGranuleRequest);
  }

  private handleCollectionChange = (collection: any) => {
    const boundingBoxes = collection.boxes;
    const collectionSpatialCoverage = cmrBoxArrToSpatialSelection(boundingBoxes);

    this.handleOrderParameterChange({
      boundingBox: collectionSpatialCoverage,
      cmrGranuleFilter: "",
      collection,
      collectionSpatialCoverage,
      temporalFilterLowerBound: moment.utc(collection.time_start),
      temporalFilterUpperBound: collection.time_end ? moment.utc(collection.time_end) : moment.utc(),
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
    this.handleCollectionChange(collection);
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

    orderParams.temporalFilterLowerBound = moment.utc(orderParams.temporalFilterLowerBound);
    orderParams.temporalFilterUpperBound = moment.utc(orderParams.temporalFilterUpperBound);

    if (orderParams.boundingBox) {
      // Convert from our plain ol' JS object back into a BoundingBox object.
      const bbox = orderParams.boundingBox;
      orderParams.boundingBox = new BoundingBox(bbox.west, bbox.south, bbox.east, bbox.north);
    }

    if (orderParams.collectionSpatialCoverage) {
      const csc = orderParams.collectionSpatialCoverage;
      if (csc.bbox) {
        // Convert from our old (< v1.2) spatial coverage array into a BoundingBox object.
        orderParams.collectionSpatialCoverage = new BoundingBox(csc.bbox[0], csc.bbox[1], csc.bbox[2], csc.bbox[3]);
      } else if (csc.west) {
        // Convert from our plain ol' JS object back into a BoundingBox object.
        orderParams.collectionSpatialCoverage = new BoundingBox(csc.west, csc.south, csc.east, csc.north);
      } else {
        orderParams.collectionSpatialCoverage = null;
      }
    }

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

  private getLocalStorageUI = () => {
    const uiSettings: string | null = localStorage.getItem(LOCAL_STORAGE_UI_KEY);
    if (uiSettings) {
      try {
        return JSON.parse(uiSettings);
      } catch (error) {
        error = null;
      }
    }
    return {};
  }

  private getLocalStorageUIByKey = (key: string, defaultValue: string) => {
    const settings = this.getLocalStorageUI();
    const value = (settings[key]) ? settings[key] : defaultValue;
    return value;
  }

  private setLocalStorageUIByKey = (key: string, value: string) => {
    const settings = this.getLocalStorageUI();
    settings[key] = value;
    localStorage.setItem(LOCAL_STORAGE_UI_KEY, JSON.stringify(settings));
  }
}
