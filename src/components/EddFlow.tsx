// @ts-nocheck
import * as React from "react";
import * as ReactModal from "react-modal";

import { OrderParameters } from "../types/OrderParameters";
import { hasChanged } from "../utils/hasChanged";
import { EddOrderConfirmation } from "./ModalContent/EddOrderConfirmation";

interface IEddFlowProps {
  onRequestClose: () => void;
  orderParameters: OrderParameters;
  show: boolean;
}

export class EddFlow extends React.Component<IEddFlowProps, {}> {
  public shouldComponentUpdate(nextProps: IEddFlowProps) {
    const propsChanged = hasChanged(this.props, nextProps, ["show"]);
    return propsChanged;
  }

  public componentDidUpdate() {
    // Use setTimeout to ensure that the OK button is rendered before setting focus.
    // See https://github.com/reactjs/react-modal/issues/51
    setTimeout(() => {
      const ok = document.getElementById("confirmEdd");
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
        <EddOrderConfirmation onCancel={this.props.onRequestClose}
          orderParameters={this.props.orderParameters} />
      </ReactModal>
    );
  }

}
