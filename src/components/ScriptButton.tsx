import * as React from "react";

import { IOrderSubmissionParameters } from "../types/OrderParameters";
import { IEnvironment } from "../utils/environment";

interface IScriptButtonProps {
  cmrResponse?: any[];
  environment: IEnvironment;
  orderSubmissionParameters?: IOrderSubmissionParameters;
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
          className="script-button"
          disabled={!this.props.orderSubmissionParameters}>
          Download Script
        </button>
      </form>
    );
  }
}
