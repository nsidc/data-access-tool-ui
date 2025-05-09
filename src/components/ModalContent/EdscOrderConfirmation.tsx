import * as React from "react";

import { OrderParameters } from "../../types/OrderParameters";
import { EarthdataSearchHandoffButton } from "../EarthdataSearchHandoffButton";

import "../../styles/eui_buttons.less";

interface IEdscOrderConfirmationProps {
  onCancel: () => void;
  onScriptDownloadClick: () => void;
  orderParameters: OrderParameters;
}

export const EdscOrderConfirmation = (props: IEdscOrderConfirmationProps) => {
  const downloadScriptLink = (
    <a onClick={() => { props.onScriptDownloadClick(); props.onCancel(); }} style={{cursor: "pointer"}}>
      download a Python script
    </a>
  );
  return (
    <div style={{display: "flex", padding: "0.5em"}}>
      <span style={{width: "50%"}}>
        <h2>Your order will be redirected</h2>

        <p>You will be directed to Earthdata Search to complete your order (see
        image). If available, you will be able to apply customizations such as
        subsetting or reformatting to your order. Your current filters will be
        transferred intact. Alternatively, you can {downloadScriptLink} or
        use Earthdata Download to retrieve your files.</p>

        <div style={{display: "flex"}}>

          <EarthdataSearchHandoffButton
            onClick={props.onCancel}
            orderParameters={props.orderParameters} />

          <button className="cancel-button eui-btn--red modal-button"
                  onClick={props.onCancel}>
            Cancel
          </button>

        </div>
      </span>

      <span style={{width: "50%", display: "inline-block"}}>
        <div>
          <img
              src={"https://nsidc.org/sites/default/files/Earthdata_Screenshot.png"}
              style={{maxWidth: "100%", height: "auto", display: "block", margin: "auto"}}
          />
          <div style={{textAlign: "center"}}>
            <em>Earthdata Search interface</em>
          </div>
        </div>
      </span>
    </div>
  );
};

(EdscOrderConfirmation as React.SFC).displayName = "EdscOrderConfirmation";
