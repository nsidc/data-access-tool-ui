import * as React from "react";

import { OrderParameters } from "../../types/OrderParameters";
import { EarthdataSearchHandoffButton } from "../EarthdataSearchHandoffButton";

interface IBigOrderConfirmationProps {
  cmrGranuleCount?: number;
  onCancel: () => void;
  onScriptDownloadClick: () => void;
  orderParameters: OrderParameters;
}

export const BigOrderConfirmation = (props: IBigOrderConfirmationProps) => {
  const downloadScriptLink = (
    <a onClick={props.onScriptDownloadClick} style={{cursor: "pointer"}}>
      download a Python script
    </a>
  );
  return (
    <div style={{display: "flex"}}>
      <span style={{width: "50%"}}>
        <h2>IMPORTANT: Your order will be redirected</h2>

        <p>Because your order is larger than 2000 files, you will be redirected
        to Earthdata Search for fulfillment (see illustration). The order will
        contain exactly the files you specified here.</p>

        <p>Alternatively, you can {downloadScriptLink}, which has no file
        limits, to retrieve your files.</p>

        <div style={{display: "flex"}}>

          <EarthdataSearchHandoffButton
            orderParameters={props.orderParameters} />

          <button className="cancel-button eui-btn--red"
                  onClick={props.onCancel}>
            Cancel
          </button>

        </div>
      </span>

      <span style={{width: "50%"}}>
        <div>
          <img src={"https://nsidc.org/jira/secure/attachment/77302/Earthdata%20Screenshot.png"} />
          <div style={{textAlign: "center"}}>
            <em>Earthdata Search interface</em>
          </div>
        </div>
      </span>
    </div>
  );
};

(BigOrderConfirmation as React.SFC).displayName = "BigOrderConfirmation";
