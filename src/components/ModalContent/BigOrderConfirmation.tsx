import * as React from "react";

import { OrderParameters } from "../../types/OrderParameters";
import { EarthdataSearchHandoffButton } from "../EarthdataSearchHandoffButton";

interface IBigOrderConfirmationProps {
  cmrGranuleCount?: number;
  onCancel: () => void;
  orderParameters: OrderParameters;
}

export const BigOrderConfirmation = (props: IBigOrderConfirmationProps) => (
  <div>
    <h2>YEET</h2>

    <p>Your order is larger than 2000 granules</p>

    <EarthdataSearchHandoffButton
      orderParameters={props.orderParameters} />

    <button className="cancel-button eui-btn--red"
            onClick={props.onCancel}>
      Cancel
    </button>
  </div>
);

(BigOrderConfirmation as React.SFC).displayName = "BigOrderConfirmation";
