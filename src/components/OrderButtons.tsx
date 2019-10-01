import * as React from "react";

import { OrderParameters } from "../types/OrderParameters";
import { OrderSubmissionParameters } from "../types/OrderSubmissionParameters";
import { boundingBoxMatch, CMR_MAX_GRANULES, filterAddWildcards } from "../utils/CMR";
import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
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
    const loggedOut = !this.props.environment.user;
    const noGranules = !this.props.cmrGranuleCount;
    const scriptButtonDisabled = !this.props.orderSubmissionParameters || noGranules;
    const orderTooLarge = this.props.cmrGranuleCount !== undefined &&
      this.props.cmrGranuleCount > CMR_MAX_GRANULES;
    const orderButtonDisabled = !this.props.orderSubmissionParameters ||
      loggedOut || orderTooLarge || noGranules;
    const earthdataButtonDisabled = !this.props.orderSubmissionParameters || noGranules;
    const loggedOutSpan = (loggedOut) ? (
      <span className="must-be-logged-in">
        You must be logged in to place an order.
      </span>
    ) : null;
    const tooltipOrder = (orderTooLarge) ? (
        <div>
          <div>To place a large order (>2000 files), use the button at right.
          You may also download a Python script, using the button at left.</div>
        </div>
      ) : (
        <div>
          <div>Once processed, your Orders page will display one or more zip files
            and a list of file URLs.</div>
          <div>{loggedOutSpan}</div>
        </div>
      );
    const tooltipEarthdata = (
      <div>
        <div>Orders >2000 files will be fulfilled via Earthdata Search.
          Also use this option to apply customizations (e.g. subset, reformat).
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
          buttonText={"Order Files"}
          tooltip={tooltipOrder}
          disabled={orderButtonDisabled}
          onSubmitOrder={this.handleSubmitOrder} />
        <SubmitButton
          buttonText={"Large/Custom Order"}
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

  private handleSubmitOrder = () => {
    this.setState({
      showConfirmationFlow: true,
    });
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

    const filenameFilter = filterAddWildcards(params.cmrGranuleFilter);

    let boundingBox = "";
    let polygon = "";
    if (params.spatialSelection && params.spatialSelection.geometry
      && (params.spatialSelection.geometry.type === "Polygon")) {
      polygon = params.spatialSelection.geometry.coordinates.join(",");
    } else {
      const collectionBoundingBox = this.props.orderParameters.collectionSpatialCoverage ?
          this.props.orderParameters.collectionSpatialCoverage.bbox : [-180, -90, 180, 90];
      if (!boundingBoxMatch(this.props.orderParameters.boundingBox, collectionBoundingBox)) {
        boundingBox = this.props.orderParameters.boundingBox.join(",");
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
