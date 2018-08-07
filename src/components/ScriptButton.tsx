import { List } from "immutable";
import * as React from "react";

import { CmrGranule } from "../types/CmrGranule";
import { OrderSubmissionParameters } from "../types/OrderSubmissionParameters";
import { IEnvironment } from "../utils/environment";

interface IScriptButtonProps {
  cmrResponse?: List<CmrGranule>;
  environment: IEnvironment;
  orderSubmissionParameters?: OrderSubmissionParameters;
}

export class ScriptButton extends React.Component<IScriptButtonProps, {}> {
  public constructor(props: IScriptButtonProps) {
    super(props);
  }

  public render() {
    let urls: string[] = [];
    if (this.props.cmrResponse) {
      this.props.cmrResponse
        .map((granule: any) => granule.links.map((link: any) => link.href))
        .map((hrefs: string[]) => urls = urls.concat(hrefs));
    }
    return (
      <form action={`${this.props.environment.urls.hermesScriptUrl}`} method="post">
        <input type="hidden" name="urls" value={urls}/>
        <button
          type="submit"
          className="script-button eui-btn--blue"
          disabled={!this.props.orderSubmissionParameters}>
          Download Script
        </button>
      </form>
    );
  }
}
