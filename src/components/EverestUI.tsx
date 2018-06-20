import * as moment from "moment";
import * as React from "react";

import { IOrderParameters, IOrderSubmissionParameters } from "../types/OrderParameters";
import { OrderTypes } from "../types/orderTypes";
import { cmrGranuleRequest, globalSpatialSelection } from "../utils/CMR";
import { GranuleList } from "./GranuleList";
import { OrderParameterInputs } from "./OrderParameterInputs";
import { SubmitButton } from "./SubmitButton";
import { ViewOrderPrompt } from "./ViewOrderPrompt";

interface IEverestState {
  cmrResponse?: object[];
  orderParameters: IOrderParameters;
  orderSubmissionParameters?: IOrderSubmissionParameters;
  orderSubmitResponse?: object;
}

export class EverestUI extends React.Component<{}, IEverestState> {
    public constructor(props: any) {
      super(props);
      this.handleOrderParameterChange = this.handleOrderParameterChange.bind(this);
      this.handleCmrResponse = this.handleCmrResponse.bind(this);
      this.handleSubmitOrderResponse = this.handleSubmitOrderResponse.bind(this);
      this.state = {
        cmrResponse: undefined,
        orderParameters: {
          collection: {},
          collectionId: "",
          spatialSelection: globalSpatialSelection,
          temporalFilterLowerBound: moment("20100101"),
          temporalFilterUpperBound: moment(),
        },
        orderSubmissionParameters: undefined,
        orderSubmitResponse: undefined,
      };
    }

    public render() {
      return (
        <div id="everest-container">
          <div id="left-side">
            <OrderParameterInputs
              onChange={this.handleOrderParameterChange}
              orderParameters={this.state.orderParameters} />
          </div>
          <div id="right-side">
            <GranuleList
              collectionId={this.state.orderParameters.collectionId}
              cmrResponse={this.state.cmrResponse} />
            <div id="order-buttons">
              <SubmitButton
                collectionId={this.state.orderParameters.collectionId}
                orderSubmissionParameters={this.state.orderSubmissionParameters}
                onSubmitOrderResponse={this.handleSubmitOrderResponse}
                orderType={OrderTypes.listOfLinks} />
              <SubmitButton
                collectionId={this.state.orderParameters.collectionId}
                orderSubmissionParameters={this.state.orderSubmissionParameters}
                onSubmitOrderResponse={this.handleSubmitOrderResponse}
                orderType={OrderTypes.zipFile} />
              <ViewOrderPrompt
                orderSubmitResponse={this.state.orderSubmitResponse} />
            </div>
          </div>
        </div>
      );
    }

    public updateGranulesFromCmr() {
      if (this.state.orderParameters.collectionId
          && this.state.orderParameters.spatialSelection
          && this.state.orderParameters.temporalFilterLowerBound
          && this.state.orderParameters.temporalFilterUpperBound) {
        cmrGranuleRequest(
          this.state.orderParameters.collectionId,
          this.state.orderParameters.spatialSelection,
          this.state.orderParameters.temporalFilterLowerBound,
          this.state.orderParameters.temporalFilterUpperBound,
        ).then((json: any) => this.handleCmrResponse(json));
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

    private handleSubmitOrderResponse(hermesResponse: any) {
      this.setState({orderSubmitResponse: hermesResponse});
    }
}
