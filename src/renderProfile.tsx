import * as React from "react";
import * as ReactDOM from "react-dom";

import "./css/index.less";

import { EverestProfile } from "./components/EverestProfile";

export const renderApp = (environment: any) => {
  ReactDOM.render(
      <EverestProfile environment={environment} />,
      document.getElementById("everest-ui-profile"),
  );
};
