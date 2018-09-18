import * as React from "react";

import { LoadingIcon } from "./LoadingIcon";

interface IGranuleCountProps {
  count?: number;
  loading: boolean;
}

export const GranuleCount = (props: IGranuleCountProps) => {
  const renderContent = () => {
    if (props.loading || props.count === undefined) {
      return (<LoadingIcon size="sm" className="loading-spinner-inline" />);
    }

    return (
      <span>{props.count.toLocaleString()}</span>
    );
  };

  return (
    <span id="granule-count-container">
      {renderContent()}
    </span>
  );
};

(GranuleCount as React.SFC).displayName = "GranuleCount";
