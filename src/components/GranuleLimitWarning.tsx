import * as React from "react";
import { CMR_MAX_GRANULES } from "../utils/CMR";

interface IGranuleLimitWarningProps {
  show: boolean;
}

export const GranuleLimitWarning = (props: IGranuleLimitWarningProps) => {
  if (!props.show) { return null; }

  return (
    <div className="order-limit-message">
      IMPORTANT: During the beta test period, orders are limited to {CMR_MAX_GRANULES}
      {" "}files regardless of the number you request.
    </div>
  );
};
