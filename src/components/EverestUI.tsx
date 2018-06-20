import * as moment from "moment";
import * as React from "react";

import { IOrderParameters } from "../types/OrderParameters";
import { OrderTypes } from "../types/orderTypes";
import { cmrGranuleRequest, globalSpatialSelection } from "../utils/CMR";
import { GranuleList } from "./GranuleList";
import { OrderParameterInputs } from "./OrderParameterInputs";
import { SubmitButton } from "./SubmitButton";
import { ViewOrderPrompt } from "./ViewOrderPrompt";

interface IEverestState {
  granules?: object[];
  orderParameters: IOrderParameters;
  orderSubmitResponse?: object;
}

export class EverestUI extends React.Component<{}, IEverestState> {
    public constructor(props: any) {
      super(props);
      this.handleOrderParameterChange = this.handleOrderParameterChange.bind(this);
      this.handleGranuleResponse = this.handleGranuleResponse.bind(this);
      this.handleSubmitOrderResponse = this.handleSubmitOrderResponse.bind(this);
      this.state = {
        granules: [],
        orderParameters: {
          collection: {},
          collectionId: "",
          spatialSelection: globalSpatialSelection,
          temporalFilterLowerBound: moment("20100101"),
          temporalFilterUpperBound: moment(),
        },
        orderSubmitResponse: undefined,
      };
    }

    public render() {
      return (
        <div>
          <div id="everest-container">
            <OrderParameterInputs
              onChange={this.handleOrderParameterChange}
              orderParameters={this.state.orderParameters} />
            <GranuleList
              collectionId={this.state.orderParameters.collectionId}
              granules={this.state.granules} />
            <div>
              <SubmitButton
                collectionId={this.state.orderParameters.collectionId}
                spatialSelection={this.state.orderParameters.spatialSelection}
                temporalLowerBound={this.state.orderParameters.temporalFilterLowerBound}
                temporalUpperBound={this.state.orderParameters.temporalFilterUpperBound}
                onGranuleResponse={this.handleGranuleResponse}
                onSubmitOrderResponse={this.handleSubmitOrderResponse}
                orderType={OrderTypes.listOfLinks} />
              <SubmitButton
                collectionId={this.state.orderParameters.collectionId}
                spatialSelection={this.state.orderParameters.spatialSelection}
                temporalLowerBound={this.state.orderParameters.temporalFilterLowerBound}
                temporalUpperBound={this.state.orderParameters.temporalFilterUpperBound}
                onGranuleResponse={this.handleGranuleResponse}
                onSubmitOrderResponse={this.handleSubmitOrderResponse}
                orderType={OrderTypes.zipFile} />
              <ViewOrderPrompt
                orderSubmitResponse={this.state.orderSubmitResponse} />
            </div>
            <div id="credit"/>
          </div>
        </div>
      );
    }

    public componentDidUpdate(_: {}, prevState: IEverestState) {
      if (this.state.orderParameters !== prevState.orderParameters) {
        if (this.state.orderParameters.collectionId
            && this.state.orderParameters.spatialSelection
            && this.state.orderParameters.temporalFilterLowerBound
            && this.state.orderParameters.temporalFilterUpperBound) {
          cmrGranuleRequest(
            this.state.orderParameters.collectionId,
            this.state.orderParameters.spatialSelection,
            this.state.orderParameters.temporalFilterLowerBound,
            this.state.orderParameters.temporalFilterUpperBound,
          ).then((json: any) => this.handleGranuleResponse(json.feed.entry));
        } else {
          console.log("Insufficient props provided.");
        }
      }
    }

    private handleOrderParameterChange(newOrderParameters: IOrderParameters, callback: any) {
      const orderParameters = Object.assign({}, this.state.orderParameters, newOrderParameters);
      this.setState({orderParameters}, callback);
    }

    private handleGranuleResponse(cmrResponse: any) {
      this.setState({granules: cmrResponse});
    }

    private handleSubmitOrderResponse(hermesResponse: any) {
      this.setState({orderSubmitResponse: hermesResponse});
    }
}
