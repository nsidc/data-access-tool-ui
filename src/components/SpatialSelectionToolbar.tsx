import * as React from "react";

import "./SpatialSelection.css";
import { SpatialSelectionType } from "./SpatialSelectionType";

interface ISpatialSelectionToolbarProps {
    onResetClick: () => void;
    onSelectionStart: () => void;
}

export class SpatialSelectionToolbar extends React.Component<ISpatialSelectionToolbarProps, {}> {
    public constructor(props: ISpatialSelectionToolbarProps) {
      super(props);
    }

    public render() {
      return (
        <div id="toolbar">
          <SpatialSelectionType name="extent" onClick={() => this.props.onSelectionStart()} />
          <SpatialSelectionType name="reset" onClick={() => this.props.onResetClick()} />
        </div>
      );
    }
}
