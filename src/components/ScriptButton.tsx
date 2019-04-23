import { List, Map } from "immutable";
import * as React from "react";
import * as ReactModal from "react-modal";
import * as ReactTooltip from "react-tooltip";

import { CmrGranule } from "../types/CmrGranule";
import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { LoadingIcon } from "./LoadingIcon";

interface IScriptButtonProps {
  cmrGranules?: List<CmrGranule>;
  disabled: boolean;
  environment: IEnvironment;
  loggedOut: boolean;
}

interface IScriptButtonState {
  loading: boolean;
}

export class ScriptButton extends React.Component<IScriptButtonProps, IScriptButtonState> {
  private formName: string = "ScriptButtonForm";

  public constructor(props: IScriptButtonProps) {
    super(props);

    this.state = {
      loading: false,
    };
  }

  public shouldComponentUpdate(nextProps: IScriptButtonProps, nextState: IScriptButtonState) {
    const propsChanged = hasChanged(this.props, nextProps, ["cmrGranules", "disabled"]);
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
      <form name={this.formName} action={this.props.environment.urls.hermesScriptUrl} method="post" className="inline">
        <input type="hidden" name="urls" value={this.urlsArray()}/>
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
      </form>
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

  private urlsArray = (): string[] => {
    if (!this.props.cmrGranules) {
      return [];
    }

    const urls: List<string> = this.props.cmrGranules
      .flatMap((granule: CmrGranule = new CmrGranule()) =>
               granule.links.map((link: Map<string, string> = Map({})) => link.get("href"))) as List<string>;

    return urls.toJS();
  }

  private submitForm = () => {
    // @ts-ignore 7017 - allow using [] on the global `document`
    // document[this.formName].submit();
    const headers: any = {
      "Content-Type": "application/json",
    };
    const body: object = {
      bounding_box: "-180,-90,180,90",
      collectionAuthId: "MOD10A2",
      collectionVersionId: "6",
      end_date: "2019-03-07T22:09:38Z",
      polygon: "-109,37,-102,37,-102,41,-109,41,-109,37",
      producer_granule_id: "*A2019*",
      start_date: "2001-01-01T00:00:00Z",
    };

    fetch(this.props.environment.urls.hermesScriptUrl, {
      body: JSON.stringify(body),
      headers,
      method: "POST",
    }).then((response) => {
      return response.json();
    }).then((result) => {
      // tslint:disable-next-line:no-console
      console.log(JSON.stringify(result));
    });

  }
}
