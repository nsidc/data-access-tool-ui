import * as React from "react";

import { OrderParameters } from "../types/OrderParameters";
import { OrderSubmissionParameters } from "../types/OrderSubmissionParameters";
import { filterAddWildcards } from "../utils/CMR";
import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { ConfirmationFlow } from "./ConfirmationFlow";
import { ScriptButton } from "./ScriptButton";
import { SubmitButton } from "./SubmitButton";

interface IOrderButtonsProps {
  cmrGranuleCount?: number;
  environment: IEnvironment;
  orderParameters: OrderParameters;
  orderSubmissionParameters?: OrderSubmissionParameters;
  totalSize: number;
}

interface IOrderButtonsState {
  showConfirmationFlow: boolean;
}

export class OrderButtons extends React.Component<IOrderButtonsProps, IOrderButtonsState> {
  public constructor(props: IOrderButtonsProps) {
    super(props);
    this.state = {
      showConfirmationFlow: false,
    };
  }

  public shouldComponentUpdate(nextProps: IOrderButtonsProps, nextState: IOrderButtonsState) {
    const propsChanged = hasChanged(this.props, nextProps, ["cmrGranuleCount",
                                                            "environment",
                                                            "orderParameters",
                                                            "orderSubmissionParameters",
                                                            "totalSize"]);
    const stateChanged = hasChanged(this.state, nextState, ["showConfirmationFlow"]);

    return propsChanged || stateChanged;
  }

  public render() {
    const loggedOut = !this.props.environment.user;
    const orderButtonDisabled = !this.props.orderSubmissionParameters || loggedOut;
    const scriptButtonDisabled = !this.props.orderSubmissionParameters;

    return (
      <div>
      <div id="order-buttons">
        <ScriptButton
          disabled={scriptButtonDisabled}
          environment={this.props.environment}
          orderParameters={this.props.orderParameters}
          onClick={this.handleScriptDownload} />
        <SubmitButton
          buttonText={"Order Files"}
          cmrGranuleCount={this.props.cmrGranuleCount}
          disabled={orderButtonDisabled}
          loggedOut={loggedOut}
          onSubmitOrder={this.handleSubmitOrder} />
        <ConfirmationFlow
          cmrGranuleCount={this.props.cmrGranuleCount}
          environment={this.props.environment}
          onRequestClose={this.closeConfirmationFlow}
          onScriptDownloadClick={this.handleScriptDownload}
          orderParameters={this.props.orderParameters}
          orderSubmissionParameters={this.props.orderSubmissionParameters}
          show={this.state.showConfirmationFlow}
          totalSize={this.props.totalSize} />
      </div>
      </div>
    );
  }

  public closeConfirmationFlow = () => {
    this.setState({showConfirmationFlow: false});
  }

  private handleSubmitOrder = () => {
    this.setState({
      showConfirmationFlow: true,
    });
  }

  private buildScriptRequestPayload = () => {
    const params = this.props.orderParameters;
    const orderInputPopulated = params.collection
      && params.collection.id
      && params.temporalFilterLowerBound;

    if (!orderInputPopulated) {
      return null;
    }

    const filenameFilter = filterAddWildcards(params.cmrGranuleFilter);

    let polygon = "";
    if (params.spatialSelection && params.spatialSelection.geometry
      && (params.spatialSelection.geometry.type === "Polygon")) {
      polygon = params.spatialSelection.geometry.coordinates.join(",");
    }

    const body: object = {
      dataset_short_name: params.collection.short_name,
      dataset_version: params.collection.version_id,
      filename_filter: filenameFilter,
      polygon,
      time_end: params.temporalFilterUpperBound.utc().format(),
      time_start: params.temporalFilterLowerBound.utc().format(),
    };
    return body;
  }

  private handleScriptDownload = () => {
    const body = this.buildScriptRequestPayload();
    if (!body) {
      return;
    }

    const headers: any = {
      "Content-Type": "application/json",
    };

    let responseHeaders: any = "";
    fetch(`${this.props.environment.urls.hermesApiUrl}/downloader-script/`, {
      body: JSON.stringify(body),
      credentials: "include",
      headers,
      method: "POST",
    }).then((response) => {
      if (response.status !== 200) {
        throw new Error(`${response.status} received from script system: "${response.statusText}"`);
      }
      responseHeaders = response.headers;
      return response.blob();
    }).then((blob) => URL.createObjectURL(blob))
      .then((url) => {
      const a = document.createElement("a");
      a.href = url;
      a.download = responseHeaders.get("content-disposition").split("filename=")[1];
      // we need to append the element to the dom, otherwise it will not work in firefox
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  }
}
