import * as React from "react";

interface IGranuleLimitWarningProps {
  show: boolean;
}

export const GranuleLimitWarning = (props: IGranuleLimitWarningProps) => {
  if (!props.show) { return null; }

  return (
    <div className="order-limit-message">
      IMPORTANT: During the beta test period, orders are limited to 2,000
      granules regardless of the number you request.
    </div>
  );
};
