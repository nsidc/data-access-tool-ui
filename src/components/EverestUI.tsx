import { fromJS, List } from "immutable";
import * as React from "react";

import { CmrGranule, ICmrGranule } from "../types/CmrGranule";
import { IOrderParameters, OrderParameters } from "../types/OrderParameters";
import { OrderSubmissionParameters } from "../types/OrderSubmissionParameters";
import { cmrGranuleRequest, cmrStatusRequest } from "../utils/CMR";
import { IEnvironment } from "../utils/environment";
import { genericShouldUpdate } from "../utils/shouldUpdate";
import { CmrDownBanner } from "./CmrDownBanner";
import { GranuleList } from "./GranuleList";
import { OrderButtons } from "./OrderButtons";
import { OrderParameterInputs } from "./OrderParameterInputs";

declare var EVEREST_UI_VERSION: string;  // defined at compile time by webpack.DefinePlugin
const __DEV__ = false;  // set to true to test CMR failure case in development

interface IEverestProps {
  environment: IEnvironment;
}

interface IEverestState {
  cmrResponse: List<CmrGranule>;
  cmrStatusChecked: boolean;
  cmrStatusOk: boolean;
  orderParameters: OrderParameters;
  orderSubmissionParameters?: OrderSubmissionParameters;
}

export class EverestUI extends React.Component<IEverestProps, IEverestState> {
    public constructor(props: any) {
      super(props);
      this.handleOrderParameterChange = this.handleOrderParameterChange.bind(this);
      this.handleCmrResponse = this.handleCmrResponse.bind(this);
      this.onCmrRequestFailure = this.onCmrRequestFailure.bind(this);
      this.state = {
        cmrResponse: List<CmrGranule>(),
        cmrStatusChecked: false,
        cmrStatusOk: false,
        orderParameters: new OrderParameters(),
        orderSubmissionParameters: undefined,
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
    }

    public shouldComponentUpdate(nextProps: IEverestProps, nextState: IEverestState) {
      return genericShouldUpdate({
        currentProps: this.props,
        currentState: this.state,
        nextProps,
        nextState,
        propsToCheck: ["environment"],
        stateToCheck: [
          "cmrResponse",
          "cmrStatusChecked",
          "cmrStatusOk",
          "orderParameters",
          "orderSubmissionParameters",
        ],
      });
    }

    public render() {
      return (
        <div id="everest-container">
          <div id="cmr-down">
            <CmrDownBanner
              cmrStatusChecked={this.state.cmrStatusChecked}
              cmrStatusOk={this.state.cmrStatusOk}
            />
          </div>
          <div id="left-side">
            <OrderParameterInputs
              cmrStatusOk={this.state.cmrStatusOk}
              environment={this.props.environment}
              onChange={this.handleOrderParameterChange}
              onCmrRequestFailure={this.onCmrRequestFailure}
              orderParameters={this.state.orderParameters} />
          </div>
          <div id="right-side">
            <GranuleList
              cmrResponse={this.state.cmrResponse} />
            <OrderButtons
              environment={this.props.environment}
              orderSubmissionParameters={this.state.orderSubmissionParameters}/>
          </div>
          <div id="version">Data Downloads UI v{EVEREST_UI_VERSION}</div>
        </div>
      );
    }

    private updateGranulesFromCmr() {
      if (!this.state.cmrStatusOk) {
        return;
      }
      if (this.state.orderParameters.collectionId
          && this.state.orderParameters.spatialSelection
          && this.state.orderParameters.temporalFilterLowerBound
          && this.state.orderParameters.temporalFilterUpperBound) {
        cmrGranuleRequest(
          this.state.orderParameters.collectionId,
          this.state.orderParameters.spatialSelection,
          this.state.orderParameters.temporalFilterLowerBound,
          this.state.orderParameters.temporalFilterUpperBound,
        ).then(this.handleCmrResponse, this.onCmrRequestFailure);
      } else {
        console.log("Insufficient props provided.");
      }
    }

    private handleOrderParameterChange(newOrderParameters: Partial<IOrderParameters>, callback: () => void) {
      // Immutable's typing for Record is incorrect; Record#merge returns a
      // Record with the same attributes, but the type definition says it
      // returns a Map (OrderParameters is a subclass of Record)
      //
      // @ts-ignore 2322
      let orderParameters: OrderParameters = this.state.orderParameters.merge(newOrderParameters);

      // really dumb way to get around issue where if spatialSelection is part
      // of the new parameters, it gets turned into a Map in the merge above; we
      // always want it to be a POJO
      if (newOrderParameters.spatialSelection) {
        orderParameters = new OrderParameters({
          collection: orderParameters.collection,
          collectionId: orderParameters.collectionId,
          spatialSelection: newOrderParameters.spatialSelection,
          temporalFilterLowerBound: orderParameters.temporalFilterLowerBound,
          temporalFilterUpperBound: orderParameters.temporalFilterUpperBound,
        });
      }

      const modifiedCallback = (): void => {
        this.updateGranulesFromCmr();
        if (callback) {
          callback();
        }
      };
      this.setState({orderParameters}, modifiedCallback);
    }

    private handleCmrResponse(response: any) {
      const cmrResponse = fromJS(response.feed.entry).map((e: ICmrGranule) => new CmrGranule(e));

      const granuleURs = cmrResponse.map((g: CmrGranule) => g.title);

      const collectionIDs = cmrResponse.map((g: CmrGranule) => g.dataset_id);
      const collectionLinks = cmrResponse.map((g: CmrGranule) => g.links.last().get("href"));
      const collectionInfo = collectionIDs.map((id: string, key: number) => List([id, collectionLinks.get(key)]));

      const orderSubmissionParameters = new OrderSubmissionParameters({collectionInfo, granuleURs});

      this.setState({cmrResponse, orderSubmissionParameters});
    }

    private onCmrRequestFailure(response: any) {
      this.setState({cmrStatusChecked: true, cmrStatusOk: false});
    }
}
