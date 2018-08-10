import { List, Map } from "immutable";
import * as React from "react";

import * as callout from "../img/callout.png";
import { CmrGranule } from "../types/CmrGranule";
import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";

interface IScriptButtonProps {
  disabled: boolean;
  cmrResponse?: List<CmrGranule>;
  environment: IEnvironment;
}

export class ScriptButton extends React.Component<IScriptButtonProps, {}> {
  public constructor(props: IScriptButtonProps) {
    super(props);
  }

  public shouldComponentUpdate(nextProps: IScriptButtonProps) {
    return hasChanged(this.props, nextProps, ["cmrResponse", "disabled"]);
  }

  public render() {
    let urls: List<string> = List<string>();
    if (this.props.cmrResponse) {
      urls = this.props.cmrResponse
               .flatMap((granule: CmrGranule = new CmrGranule()) =>
                 granule.links.map((link: Map<string, string> = Map({})) => link.get("href"))) as List<string>;
    }
    return (
      <form action={this.props.environment.urls.hermesScriptUrl} method="post">
        <input type="hidden" name="urls" value={urls.toJS()}/>
        <div className="tooltip">
          <button
            type="submit"
            className="script-button eui-btn--blue"
            disabled={this.props.disabled}>
            Download Script
          </button>
          <span>
            <img className="img-no-border-left callout" src={callout} />
            Download a command line script that will retrieve all the files.
          </span>
        </div>
      </form>
    );
  }
}
