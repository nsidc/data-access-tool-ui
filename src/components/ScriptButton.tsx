import * as React from "react";
import * as ReactModal from "react-modal";
import * as ReactTooltip from "react-tooltip";

import { OrderParameters } from "../types/OrderParameters";
import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { LoadingIcon } from "./LoadingIcon";

interface IScriptButtonProps {
  disabled: boolean;
  environment: IEnvironment;
  loggedOut: boolean;
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
        {this.renderForm()}
        {this.renderLoadingIcon()}
      </span>
    );
  }

  private renderForm = () => {
    const tooltipSpan = <span>Download Python script (requires Python 2 or 3).</span>;
    const loggedOutSpan = (this.props.loggedOut) ? (
      <span>
        <br/>
        <span className="must-be-logged-in">You must be logged in.</span>
      </span>
    ) : null;
    const tooltip = <div>{tooltipSpan}{loggedOutSpan}</div>;

    return (
      <div className="tooltip" data-tip data-for="scriptbutton">
        <ReactTooltip id="scriptbutton" className="reactTooltip"
          effect="solid" delayShow={500}>{tooltip}</ReactTooltip>
        <button
          type="button"
          className="script-button eui-btn--blue"
          disabled={this.props.disabled}
          onClick={this.submitForm}>
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

    let f = params.cmrGranuleFilter;
    if (!f.startsWith("*")) { f = "*" + f; }
    if (!f.endsWith("*")) { f += "*"; }
    const cmrGranuleFilter = f;

    let collectionSpatialCoverage = "";
    if (params.collectionSpatialCoverage && params.collectionSpatialCoverage.hasOwnProperty("bbox")) {
      collectionSpatialCoverage = params.collectionSpatialCoverage.bbox.join(",");
    }
    let spatialSelection = "";
    if (params.spatialSelection && params.spatialSelection.geometry
      && (params.spatialSelection.geometry.type === "Polygon")) {
      spatialSelection = params.spatialSelection.geometry.coordinates.join(",");
    }

    const body: object = {
      cmrGranuleFilter,
      collectionAuthId: params.collection.short_name,
      collectionSpatialCoverage,
      collectionVersionId: params.collection.version_id,
      spatialSelection,
      temporalLowerBound: params.temporalFilterLowerBound.utc().format(),
      temporalUpperBound: params.temporalFilterUpperBound.utc().format(),
    };
    return body;
  }

  private submitForm = () => {
    const body = this.getBody();
    if (!body) {
      return;
    }

    const headers: any = {
      "Content-Type": "application/json",
    };

    fetch(this.props.environment.urls.hermesScriptUrl, {
      body: JSON.stringify(body),
      credentials: "include",
      headers,
      method: "POST",
    }).then((response) => {
//      if (![200, 201].includes(response.status)) {
//        throw new Error(`${response.status} received from script system: "${response.statusText}"`);
//      }
      return response.blob();
    }).then((result) => {
      const url = window.URL.createObjectURL(result);
      const a = document.createElement("a");
      a.href = url;
      a.download = "filename.py";
      // we need to append the element to the dom -> otherwise it will not work in firefox
      document.body.appendChild(a);
      a.click();
      a.remove();
    });

  }
}
