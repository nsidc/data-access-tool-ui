import * as React from "react";

import "../styles/index.less";
import { hasChanged } from "../utils/hasChanged";
import { PolygonMode } from "../utils/PolygonMode";

interface ILonLatProps {
  lonLatEnable: boolean;
  lonLatLabel: string;
  polygonMode: PolygonMode;
  updateLonLat: any;
}

export class LonLatInput extends React.Component<ILonLatProps, {}> {

  public componentDidUpdate(prevProps: ILonLatProps) {
    if (hasChanged(prevProps, this.props, ["lonLatEnable"]) && this.props.lonLatEnable) {
      document.getElementById("lonLat")!.focus();
    }
  }

  public render() {
    if (this.props.lonLatLabel === "") {
      return null;
    }
    return (
      <div>
        <input id="lonLat" type="text" disabled={!this.props.lonLatEnable}
          value={this.props.lonLatLabel} onChange={this.handleLonLat} onKeyDown={this.lonLatOnKeydown}>
        </input>
      </div>
    );
  }

  private handleLonLat = (e: any) => {
    this.props.updateLonLat(e.target.value);
  }

  private lonLatOnKeydown = (e: any) => {
    switch (e.key) {
      case "Enter":
        this.props.polygonMode.changeLonLat(e.target.value);
        break;
      case "Escape":
        this.props.polygonMode.resetLonLat();
        break;
      case "Tab":
        this.props.polygonMode.changeLonLat(e.target.value);
        if (e.shiftKey) {
          this.props.polygonMode.activateRelativePoint(-1);
        } else {
          this.props.polygonMode.activateRelativePoint(+1);
        }
        e.preventDefault();
        break;
      default:
        break;
    }
  }
}
