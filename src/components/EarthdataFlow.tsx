// @ts-nocheck
import * as React from "react";
import * as ReactModal from "react-modal";

import { OrderParameters } from "../types/OrderParameters";
import { hasChanged } from "../utils/hasChanged";
import { EdscOrderConfirmation } from "./ModalContent/EdscOrderConfirmation";

interface IEarthdataFlowProps {
  onRequestClose: () => void;
  onScriptDownloadClick: () => void;
  orderParameters: OrderParameters;
  show: boolean;
  totalSize: number;
}

export class EarthdataFlow extends React.Component<IEarthdataFlowProps, {}> {
  public shouldComponentUpdate(nextProps: IEarthdataFlowProps) {
    const propsChanged = hasChanged(this.props, nextProps, ["show"]);
    return propsChanged;
  }

  public componentDidUpdate() {
    // Use setTimeout to ensure that the OK button is rendered before setting focus.
    // See https://github.com/reactjs/react-modal/issues/51
    setTimeout(() => {
      const ok = document.getElementById("confirmEarthdata");
      if (ok) {
        ok.focus();
      }
    }, 0);
  }

  public render() {
    return (
      <ReactModal className="modal-content"
                  isOpen={this.props.show}
                  onRequestClose={this.props.onRequestClose}
                  parentSelector={() => document.getElementById("everest-ui") || document.body}>
        <EdscOrderConfirmation onCancel={this.props.onRequestClose}
          onScriptDownloadClick={this.props.onScriptDownloadClick}
          orderParameters={this.props.orderParameters} />
      </ReactModal>
    );
  }

}
