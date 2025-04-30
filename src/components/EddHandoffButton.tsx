import * as React from "react";

import { hasChanged } from "../utils/hasChanged";

import "../styles/eui_buttons.less";

interface IHandoffButtonProps {
  onClick: () => void;
  eddDeeplink: any;
}

export class EddHandoffButton extends React.Component<IHandoffButtonProps> {
  public constructor(props: IHandoffButtonProps) {
    super(props);

    this.state = {
      loading: false,
    };
  }

  public shouldComponentUpdate(nextProps: IHandoffButtonProps) {
    const propsChanged = hasChanged(this.props, nextProps, ["orderParameters"]);

    return propsChanged;
  }

  public render() {
    return (
      <button
        id="confirmEdd"
        type="button"
        className="handoff-button eui-btn--blue modal-button"
        onClick={() => {
          window.open(this.props.eddDeeplink, "_self");
          }}>
        Open Earthdata Download
      </button>
    );
  }

}
