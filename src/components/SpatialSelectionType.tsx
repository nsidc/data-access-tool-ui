// @ts-nocheck
import * as React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as ReactTooltip from "react-tooltip";
import "../styles/index.less";
import { hasChanged } from "../utils/hasChanged";

interface ISpatialSelectionTypeProps {
  title: string;
  img: any;
  name: string;
  onClick: any;
  disabled?: boolean;
}

export class SpatialSelectionType extends React.Component <ISpatialSelectionTypeProps, {}> {
  public constructor(props: ISpatialSelectionTypeProps) {
    super(props);
  }

  public shouldComponentUpdate(nextProps: ISpatialSelectionTypeProps) {
    return hasChanged(this.props, nextProps, ["title", "img", "name", "disabled"]);
  }

  public render() {
    const divStyle = (this.props.disabled ? "toolbarButtonDisabled " : "") +
      "cesium-button cesium-toolbar-button";
    return (
      <div className={divStyle} data-tip={this.props.title}
        onClick={
          (e: any) => {
            this.props.onClick(e.target.value);
            // If button gets disabled (say for "Reset"), force Tooltip to hide
            // since the button will no longer send the OnMouseOut event.
            ReactTooltip.hide();
          }
        }
      >
        <button className="toolbarButton"
          disabled={this.props.disabled}>
          <FontAwesomeIcon icon={this.props.img} />
        </button>
      </div>
    );
  }
}
