import * as React from "react";

import { OrderParameters } from "../../types/OrderParameters";
import { EddHandoffButton } from "../EddHandoffButton";

interface IEddOrderConfirmationProps {
  onCancel: () => void;
  orderParameters: OrderParameters;
}

export const EddOrderConfirmation = (props: IEddOrderConfirmationProps) => {
  return (
    <div style={{display: "flex"}}>
      <span style={{width: "50%"}}>
        <h2>Your order will be handled by Earthdata Download.</h2>

        <p>You must have Earthdata Downloaded.
          Your current order will be transferred intact.</p>

        <div style={{display: "flex"}}>

          <EddHandoffButton
            onClick={props.onCancel}
            orderParameters={props.orderParameters} />

          <button className="cancel-button eui-btn--red"
                  onClick={props.onCancel}>
            Cancel
          </button>

        </div>
      </span>
    </div>
  );
};

(EddOrderConfirmation as React.SFC).displayName = "EddOrderConfirmation";
