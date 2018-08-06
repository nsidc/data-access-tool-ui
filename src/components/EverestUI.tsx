import * as moment from "moment";
import * as React from "react";

import { IOrderParameters, IOrderSubmissionParameters } from "../types/OrderParameters";
import { cmrGranuleRequest, cmrStatusRequest, globalSpatialSelection } from "../utils/CMR";
import { IEnvironment } from "../utils/environment";
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
  cmrResponse?: object[];
  cmrStatusChecked: boolean;
  cmrStatusOk: boolean;
  orderParameters: IOrderParameters;
  orderSubmissionParameters?: IOrderSubmissionParameters;
}

export class EverestUI extends React.Component<IEverestProps, IEverestState> {
    public constructor(props: any) {
      super(props);
      this.handleOrderParameterChange = this.handleOrderParameterChange.bind(this);
      this.handleCmrResponse = this.handleCmrResponse.bind(this);
      this.onCmrRequestFailure = this.onCmrRequestFailure.bind(this);
      this.state = {
        cmrResponse: undefined,
        cmrStatusChecked: false,
        cmrStatusOk: false,
        orderParameters: {
          collection: {},
          collectionId: "",
          spatialSelection: globalSpatialSelection,
          temporalFilterLowerBound: moment("20100101"),
          temporalFilterUpperBound: moment(),
        },
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
              collectionId={this.state.orderParameters.collectionId}
              cmrResponse={this.state.cmrResponse} />
            <OrderButtons
              environment={this.props.environment}
              orderSubmissionParameters={this.state.orderSubmissionParameters}/>
          </div>
          <div id="version">Data Downloads UI v{EVEREST_UI_VERSION}</div>
        </div>
      );
    }

    public updateGranulesFromCmr() {
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

    private handleOrderParameterChange(newOrderParameters: IOrderParameters, callback: any) {
      const orderParameters = Object.assign({}, this.state.orderParameters, newOrderParameters);
      const modifiedCallback = (): void => {
        this.updateGranulesFromCmr();
        if (callback) {
          callback();
        }
      };
      this.setState({orderParameters}, modifiedCallback);
    }

    private handleCmrResponse(response: any) {
      const cmrResponse = response.feed.entry;
      this.setState({cmrResponse});

      const granuleURs = cmrResponse.map((g: any) => g.title);
      const collectionIDs = cmrResponse.map((g: any) => g.dataset_id);
      const collectionLinks = cmrResponse.map((g: any) => g.links.slice(-1)[0].href);
      const collectionInfo = collectionIDs.map((id: string, index: number) => [id, collectionLinks[index]]);
      this.setState({orderSubmissionParameters: {granuleURs, collectionInfo}});
    }

    private onCmrRequestFailure(response: any) {
      this.setState({cmrStatusChecked: true, cmrStatusOk: false});
    }
}
