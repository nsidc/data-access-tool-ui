import { List, Map } from "immutable";
import * as React from "react";

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
        <button
          type="submit"
          className="script-button eui-btn--blue"
          disabled={this.props.disabled}>
          Download Script
        </button>
      </form>
    );
  }
}
