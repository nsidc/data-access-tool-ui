import { List, Map } from "immutable";
import * as React from "react";
import * as ReactModal from "react-modal";

import * as callout from "../img/callout.png";
import { CmrGranule } from "../types/CmrGranule";
import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { LoadingIcon } from "./LoadingIcon";

interface IScriptButtonProps {
  cmrGranules?: List<CmrGranule>;
  disabled: boolean;
  ensureGranuleScrollDepleted: (callback?: () => any) => void;
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
      <div>
        {this.renderForm()}
        {this.renderLoadingIcon()}
      </div>
    );
  }

  private renderForm = () => {
    const loggedOutSpan = this.props.loggedOut ? (
      <span>
        <br/>
        <span className="must-be-logged-in">You must be logged in.</span>
      </span>
    ) : null;

    return (
      <form name={this.formName} action={this.props.environment.urls.hermesScriptUrl} method="post" className="inline">
        <input type="hidden" name="urls" value={this.urlsArray()}/>
        <div className="tooltip">
          <span className="hover-text">
            Download a command line script that will retrieve all the files.
            {loggedOutSpan}
            <img className="img-no-border-left callout" src={callout} />
          </span>
          <button
            type="button"
            className="script-button eui-btn--blue"
            disabled={this.props.disabled}
            onClick={this.handleClick}>
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

  private handleClick = () => {
    this.setState({loading: true}, () => {
      this.props.ensureGranuleScrollDepleted(() => {
        this.setState({loading: false}, this.submitForm);
      });
    });
  }

  private submitForm = () => {
    // @ts-ignore 7017 - allow reference to the global `document`
    document[this.formName].submit();
  }
}
