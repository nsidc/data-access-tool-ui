import * as React from "react";
import * as ReactModal from "react-modal";
import * as ReactTooltip from "react-tooltip";

import { OrderParameters } from "../types/OrderParameters";
import { filterAddWildcards } from "../utils/CMR";
import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { LoadingIcon } from "./LoadingIcon";

interface IScriptButtonProps {
  disabled: boolean;
  environment: IEnvironment;
  orderParameters: OrderParameters;
}

interface IScriptButtonState {
  loading: boolean;
}

export class ScriptButton extends React.Component<IScriptButtonProps, IScriptButtonState> {
  public constructor(props: IScriptButtonProps) {
    super(props);

    this.state = {
      loading: false,
    };
  }

  public shouldComponentUpdate(nextProps: IScriptButtonProps, nextState: IScriptButtonState) {
    const propsChanged = hasChanged(this.props, nextProps, ["orderParameters", "disabled"]);
    const stateChanged = hasChanged(this.state, nextState, ["loading"]);

    return propsChanged || stateChanged;
  }

  public render() {
    return (
      <span>
        {this.renderScriptButton()}
        {this.renderLoadingIcon()}
      </span>
    );
  }

  private renderScriptButton = () => {
    const tooltip = <div><span>Download Python script (requires Python 2 or 3).</span></div>;

    return (
      <div className="tooltip" data-tip data-for="scriptbutton">
        <ReactTooltip id="scriptbutton" className="reactTooltip"
          effect="solid" delayShow={500}>{tooltip}</ReactTooltip>
        <button
          type="button"
          className="script-button eui-btn--blue"
          disabled={this.props.disabled}
          onClick={this.downloadScript}>
          Download Script
        </button>
      </div>
    );
  }

  private renderLoadingIcon = () => {
    return (
      <ReactModal className="modal-content"
        isOpen={this.state.loading}
        parentSelector={() => document.getElementById("everest-ui") || document.body}>
        <LoadingIcon size="5x" />
      </ReactModal>
    );
  }

  private getBody = () => {
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

  private downloadScript = () => {
    const body = this.getBody();
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
