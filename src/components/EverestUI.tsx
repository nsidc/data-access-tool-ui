import { fromJS, List } from "immutable";
import * as moment from "moment";
import * as React from "react";

import { CmrCollection, ICmrCollection } from "../types/CmrCollection";
import { CmrGranule, ICmrGranule } from "../types/CmrGranule";
import { IDrupalDataset } from "../types/DrupalDataset";
import { IOrderParameters, OrderParameters } from "../types/OrderParameters";
import { OrderSubmissionParameters } from "../types/OrderSubmissionParameters";
import { cmrCollectionRequest, cmrGranuleRequest, cmrStatusRequest } from "../utils/CMR";
import { cmrBoxArrToSpatialSelection } from "../utils/CMR";
import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { CmrDownBanner } from "./CmrDownBanner";
import { CollectionDropdown } from "./CollectionDropdown";
import { GranuleList } from "./GranuleList";
import { OrderButtons } from "./OrderButtons";
import { OrderParameterInputs } from "./OrderParameterInputs";

const __DEV__ = false;  // set to true to test CMR failure case in development

interface IEverestProps {
  environment: IEnvironment;
}

interface IEverestState {
  cmrLoading: boolean;
  cmrResponse: List<CmrGranule>;
  cmrStatusChecked: boolean;
  cmrStatusOk: boolean;
  orderParameters: OrderParameters;
  orderSubmissionParameters?: OrderSubmissionParameters;
  stateCanBeFrozen: boolean;
}

export class EverestUI extends React.Component<IEverestProps, IEverestState> {
  public constructor(props: any) {
    super(props);
    this.state = {
      cmrLoading: false,
      cmrResponse: List<CmrGranule>(),
      cmrStatusChecked: false,
      cmrStatusOk: false,
      orderParameters: new OrderParameters(),
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

    if (this.props.environment.inDrupal && this.props.environment.drupalDataset) {
      this.initializeState(this.props.environment.drupalDataset);
    }
  }

  public shouldComponentUpdate(nextProps: IEverestProps, nextState: IEverestState) {
    const propsChanged = hasChanged(this.props, nextProps, ["environment"]);
    const stateChanged = hasChanged(this.state, nextState, [
      "cmrLoading",
      "cmrResponse",
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
            orderParameters={this.state.orderParameters}
            resetSpatialSelection={this.resetSpatialSelection} />
        </div>
        <div id="right-side">
          <GranuleList
            cmrResponse={this.state.cmrResponse}
            loading={this.state.cmrLoading}
            orderParameters={this.state.orderParameters} />
          <OrderButtons
            environment={this.props.environment}
            orderSubmissionParameters={this.state.orderSubmissionParameters}
            cmrResponse={this.state.cmrResponse} />
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
     .finally(() => this.setState({cmrLoading: false}));
  }

  private handleOrderParameterChange = (newOrderParameters: Partial<IOrderParameters>, callback?: () => void) => {
    // Immutable's typing for Record is incorrect; Record#merge returns a
    // Record with the same attributes, but the type definition says it
    // returns a Map (OrderParameters is a subclass of Record)
    //
    // @ts-ignore 2322
    let orderParameters: OrderParameters = this.state.orderParameters.merge(newOrderParameters);

    let aGeoJsonPolygonWasUpdated: boolean = false;

    let spatialSelection = orderParameters.spatialSelection;
    if (newOrderParameters.spatialSelection) {
      aGeoJsonPolygonWasUpdated = true;
      spatialSelection = newOrderParameters.spatialSelection;
    }

    let collectionSpatialCoverage = orderParameters.collectionSpatialCoverage;
    if (newOrderParameters.collectionSpatialCoverage) {
      aGeoJsonPolygonWasUpdated = true;
      collectionSpatialCoverage = newOrderParameters.collectionSpatialCoverage;
    }

    // ensure the GeoJSON polygons are POJOS; with the .merge() call above,
    // they are converted to Immutable Maps
    if (aGeoJsonPolygonWasUpdated) {
      orderParameters = new OrderParameters({
        collection: orderParameters.collection,
        collectionSpatialCoverage,
        spatialSelection,
        temporalFilterLowerBound: orderParameters.temporalFilterLowerBound,
        temporalFilterUpperBound: orderParameters.temporalFilterUpperBound,
      });
    }

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

  private handleCmrGranuleResponse = (response: any) => {
    const cmrResponse = fromJS(response.feed.entry).map((e: ICmrGranule) => new CmrGranule(e));

    const granuleURs = cmrResponse.map((g: CmrGranule) => g.title);

    const collectionIDs = cmrResponse.map((g: CmrGranule) => g.dataset_id);
    const collectionLinks = cmrResponse.map((g: CmrGranule) => g.links.last().get("href"));
    const collectionInfo = collectionIDs.map((id: string, key: number) => List([id, collectionLinks.get(key)]));

    const orderSubmissionParameters = new OrderSubmissionParameters({collectionInfo, granuleURs});

    this.setState({cmrResponse, orderSubmissionParameters});
  }

  private onCmrRequestFailure = (response: any) => {
    this.setState({cmrStatusChecked: true, cmrStatusOk: false});
  }

  private handleCollectionChange = (collection: any) => {
    this.handleOrderParameterChange({
      collection,
      temporalFilterLowerBound: moment(collection.time_start),
      temporalFilterUpperBound: collection.time_end ? moment(collection.time_end) : moment(),
    }, this.resetCollectionSpatialCoverage);
  }

  private resetCollectionSpatialCoverage = () => {
    const boundingBoxes = this.state.orderParameters.collection.boxes;
    const collectionSpatialCoverage = cmrBoxArrToSpatialSelection(boundingBoxes);
    this.handleOrderParameterChange({
      collectionSpatialCoverage,
    });
  }

  private resetSpatialSelection = () => {
    this.handleOrderParameterChange({
      spatialSelection: null,
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

  private initializeState = (selectedCollection: IDrupalDataset) => {
    const localStorageOrderParams: string | null = localStorage.getItem("nsidcDataOrderParams");
    if (localStorageOrderParams) {
      const orderParams: any = JSON.parse(localStorageOrderParams);
      orderParams.temporalFilterLowerBound = moment(orderParams.temporalFilterLowerBound);
      orderParams.temporalFilterUpperBound = moment(orderParams.temporalFilterUpperBound);
      const orderParameters: OrderParameters = new OrderParameters(...orderParams);

      if (selectedCollection.id === orderParameters.collection.short_name) {
        this.hydrateState(orderParameters);
        return;
      }
    }
    this.initStateFromCollectionDefaults(selectedCollection);
  }

  private initStateFromCollectionDefaults = (selectedCollection: IDrupalDataset) => {
    const datasetId: string = selectedCollection.id;
    const datasetVersion: number = Number(selectedCollection.version);
    cmrCollectionRequest(datasetId, datasetVersion)
      .then(this.handleCmrCollectionResponse, this.onCmrRequestFailure)
      .then(() => this.setState({stateCanBeFrozen: true}));
  }

  private freezeState = () => {
    return localStorage.setItem("nsidcDataOrderParams", JSON.stringify(this.state.orderParameters));
  }

  private hydrateState = (orderParameters: OrderParameters) => {
    console.warn("Order parameters loaded from previous state.");
    this.handleOrderParameterChange(orderParameters);
    this.setState({stateCanBeFrozen: true});
  }
}
