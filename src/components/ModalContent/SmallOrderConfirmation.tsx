import * as React from "react";

import { CMR_MAX_GRANULES, formatBytes } from "../../utils/CMR";
import { GranuleLimitWarning } from "../GranuleLimitWarning";

interface ISmallOrderConfirmationProps {
  cmrGranuleCount?: number;
  totalSize: number;
  onCancel: () => void;
  onOK: () => void;
}

export const SmallOrderConfirmation = (props: ISmallOrderConfirmationProps) => {
  let showWarning: boolean = false;
  let cmrGranuleCount = props.cmrGranuleCount ? props.cmrGranuleCount : 0;
  let totalSize = props.totalSize;
  if (cmrGranuleCount > CMR_MAX_GRANULES) {
    showWarning = true;
    totalSize = totalSize / cmrGranuleCount * CMR_MAX_GRANULES;
    cmrGranuleCount = CMR_MAX_GRANULES;
  }
  const countFiles = cmrGranuleCount + (cmrGranuleCount !== 1 ? " files" : " file");

  return (
    <div>
      <h3>Confirm Your Download Order</h3>
      <p>
        Your download order contains {countFiles} (approximately {formatBytes(totalSize)}).
        Your order is about to be submitted. You will be able to view
        the status of your order on the Orders page.
      </p>
      <button className="submit-button eui-btn--blue"
              id="confirmOrder"
              onClick={props.onOK}>
        OK
      </button>
      <button className="cancel-button eui-btn--red"
              onClick={props.onCancel}>
        Cancel
      </button>
      <GranuleLimitWarning show={showWarning}/>
    </div>
  );
};

(SmallOrderConfirmation as React.SFC).displayName = "SmallOrderConfirmation";
