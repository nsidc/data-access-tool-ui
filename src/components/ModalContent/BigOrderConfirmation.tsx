import * as React from "react";

import { OrderParameters } from "../../types/OrderParameters";
import { EarthdataSearchHandoffButton } from "../EarthdataSearchHandoffButton";

interface IBigOrderConfirmationProps {
  onCancel: () => void;
  onScriptDownloadClick: () => void;
  orderParameters: OrderParameters;
}

export const BigOrderConfirmation = (props: IBigOrderConfirmationProps) => {
  const downloadScriptLink = (
    <a onClick={() => { props.onScriptDownloadClick(); props.onCancel(); }} style={{cursor: "pointer"}}>
      download a Python script
    </a>
  );
  return (
    <div style={{display: "flex"}}>
      <span style={{width: "50%"}}>
        <h2>Your order will be redirected</h2>

        <p>You will be redirected to Earthdata Search for fulfillment (see illustration).
          Your current order will be transferred intact.</p>

        <p>Alternatively, you can {downloadScriptLink}, to retrieve your files.</p>

        <div style={{display: "flex"}}>

          <EarthdataSearchHandoffButton
            onClick={props.onCancel}
            orderParameters={props.orderParameters} />

          <button className="cancel-button eui-btn--red"
                  onClick={props.onCancel}>
            Cancel
          </button>

        </div>
      </span>

      <span style={{width: "50%"}}>
        <div>
          <img src={"https://nsidc.org/sites/default/files/Earthdata_Screenshot.png"} />
          <div style={{textAlign: "center"}}>
            <em>Earthdata Search interface</em>
          </div>
        </div>
      </span>
    </div>
  );
};

(BigOrderConfirmation as React.SFC).displayName = "BigOrderConfirmation";
