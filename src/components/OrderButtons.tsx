import * as React from "react";

import { BoundingBox } from "../types/BoundingBox";
import { OrderParameters } from "../types/OrderParameters";
import { OrderSubmissionParameters } from "../types/OrderSubmissionParameters";
import { boundingBoxMatch, combineGranuleFilters } from "../utils/CMR";
import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { EdscFlow } from "./EdscFlow";
import { EddFlow } from "./EddFlow";
import { ScriptButton } from "./ScriptButton";
import { SubmitButton } from "./SubmitButton";
import { EddButton } from "./EddButton";

interface IOrderButtonsProps {
  cmrGranuleCount?: number;
  environment: IEnvironment;
  orderParameters: OrderParameters;
  orderSubmissionParameters?: OrderSubmissionParameters;
  totalSize: number;
}

interface IOrderButtonsState {
  showEdscFlow: boolean;
  showEddFlow: boolean;
}

export class OrderButtons extends React.Component<IOrderButtonsProps, IOrderButtonsState> {

  public constructor(props: IOrderButtonsProps) {
    super(props);
    this.state = {
      showEdscFlow: false,
      showEddFlow: false,
    };
  }

  public shouldComponentUpdate(nextProps: IOrderButtonsProps, nextState: IOrderButtonsState) {
    const propsChanged = hasChanged(this.props, nextProps, ["cmrGranuleCount",
                                                            "environment",
                                                            "orderParameters",
                                                            "orderSubmissionParameters",
                                                            "totalSize"]);
    const stateChanged = hasChanged(this.state, nextState, ["showEdscFlow", "showEddFlow"]);

    return propsChanged || stateChanged;
  }

  public render() {
    const noGranules = !this.props.cmrGranuleCount;
    const orderButtonDisabled = !this.props.orderSubmissionParameters || noGranules;

    const tooltipEarthdata = (
      <div>

        <div>Use Earthdata Search to apply customizations (e.g., subset,
          reformat) prior to downloading data files. Your current filter
          selections will be automatically transferred.
        </div>
      </div>
    );

    const tooltipEdd = (
      <div>
        <div>Download files with the Earthdata Download application, a data
          download management tool. The application must be installed. Supports
          direct download for any number of files.
        </div>
      </div>
    );

    return (
      <div>
      <div id="order-buttons">
        <ScriptButton
          disabled={orderButtonDisabled}
          environment={this.props.environment}
          orderParameters={this.props.orderParameters}
          onClick={this.handleScriptDownload} />
        <EddButton
          disabled={orderButtonDisabled}
          buttonText={"Download Files"}
          buttonId={"orderEddFilesButton"}
          tooltip={tooltipEdd}
          onEddOrder={this.handleEddOrder} />
        <SubmitButton
          buttonText={"Order via Earthdata Search"}
          buttonId={"orderEarthdataFilesButton"}
          tooltip={tooltipEarthdata}
          disabled={orderButtonDisabled}
          onSubmitOrder={this.handleEarthdataOrder} />
        <EdscFlow
          onRequestClose={this.closeEdscFlow}
          onScriptDownloadClick={this.handleScriptDownload}
          orderParameters={this.props.orderParameters}
          show={this.state.showEdscFlow}
          totalSize={this.props.totalSize} />
        <EddFlow
          onRequestClose={this.closeEddFlow}
          orderParameters={this.props.orderParameters}
          environment={this.props.environment}
          show={this.state.showEddFlow} />
      </div>
      </div>
    );
  }

  private closeEdscFlow = () => {
    this.setState({ showEdscFlow: false });
  }

  private closeEddFlow = () => {
    this.setState({ showEddFlow: false });
  }

  private handleEarthdataOrder = () => {
    this.setState({
      showEdscFlow: true,
    });
  }

  private handleEddOrder = () => {
    this.setState({
      showEddFlow: true,
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
     combineGranuleFilters(params.cmrGranuleFilter, ",", "") : "";

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
    fetch(`${this.props.environment.urls.datBackendApiUrl}/downloader-script/`, {
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
