import * as React from "react";

import { BoundingBox } from "../types/BoundingBox";
import { OrderParameters } from "../types/OrderParameters";
import { OrderSubmissionParameters } from "../types/OrderSubmissionParameters";
import { boundingBoxMatch, filterAddWildcards } from "../utils/CMR";
import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { UserContext } from "../utils/state";
import { ConfirmationFlow } from "./ConfirmationFlow";
import { EarthdataFlow } from "./EarthdataFlow";
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
  showEarthdataFlow: boolean;
}

export class OrderButtons extends React.Component<IOrderButtonsProps, IOrderButtonsState> {
  public static contextType = UserContext;

  public constructor(props: IOrderButtonsProps) {
    super(props);
    this.state = {
      showConfirmationFlow: false,
      showEarthdataFlow: false,
    };
  }

  public shouldComponentUpdate(nextProps: IOrderButtonsProps, nextState: IOrderButtonsState) {
    const propsChanged = hasChanged(this.props, nextProps, ["cmrGranuleCount",
                                                            "environment",
                                                            "orderParameters",
                                                            "orderSubmissionParameters",
                                                            "totalSize"]);
    const stateChanged = hasChanged(this.state, nextState, ["showConfirmationFlow", "showEarthdataFlow"]);

    return propsChanged || stateChanged;
  }

  public render() {
    const noGranules = !this.props.cmrGranuleCount;
    const scriptButtonDisabled = !this.props.orderSubmissionParameters || noGranules;
    const earthdataButtonDisabled = !this.props.orderSubmissionParameters || noGranules;
    const tooltipEarthdata = (
      <div>
        <div>Fulfill order via Earthdata Search.
          Use this option to apply customizations (e.g. subset, reformat).
          Your current order will be transferred intact for completion.
        </div>
      </div>
    );

    return (
      <div>
      <div id="order-buttons">
        <ScriptButton
          disabled={scriptButtonDisabled}
          environment={this.props.environment}
          orderParameters={this.props.orderParameters}
          onClick={this.handleScriptDownload} />
        <SubmitButton
          buttonText={"Order Data"}
          buttonId={"orderEarthdataFilesButton"}
          tooltip={tooltipEarthdata}
          disabled={earthdataButtonDisabled}
          onSubmitOrder={this.handleEarthdataOrder} />
        <ConfirmationFlow
          cmrGranuleCount={this.props.cmrGranuleCount}
          environment={this.props.environment}
          onRequestClose={this.closeConfirmationFlow}
          onScriptDownloadClick={this.handleScriptDownload}
          orderParameters={this.props.orderParameters}
          orderSubmissionParameters={this.props.orderSubmissionParameters}
          show={this.state.showConfirmationFlow}
          totalSize={this.props.totalSize} />
        <EarthdataFlow
          onRequestClose={this.closeEarthdataFlow}
          onScriptDownloadClick={this.handleScriptDownload}
          orderParameters={this.props.orderParameters}
          show={this.state.showEarthdataFlow}
          totalSize={this.props.totalSize} />
      </div>
      </div>
    );
  }

  private closeConfirmationFlow = () => {
    this.setState({showConfirmationFlow: false});
  }

  private closeEarthdataFlow = () => {
    this.setState({ showEarthdataFlow: false });
  }

  private handleEarthdataOrder = () => {
    this.setState({
      showEarthdataFlow: true,
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

    const filenameFilter = params.cmrGranuleFilter ?
      filterAddWildcards(params.cmrGranuleFilter) : "";

    let boundingBox = "";
    let polygon = "";
    if (params.spatialSelection && params.spatialSelection.geometry
      && (params.spatialSelection.geometry.type === "Polygon")) {
      polygon = params.spatialSelection.geometry.coordinates.join(",");
    } else {
      const collectionBoundingBox =
        this.props.orderParameters.collectionSpatialCoverage ?
          this.props.orderParameters.collectionSpatialCoverage : BoundingBox.global();
      if (!boundingBoxMatch(this.props.orderParameters.boundingBox, collectionBoundingBox)) {
        boundingBox = this.props.orderParameters.boundingBox.rect.join(",");
      }
    }

    const body: object = {
      bounding_box: boundingBox,
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
