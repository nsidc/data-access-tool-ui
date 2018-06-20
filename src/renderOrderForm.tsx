import * as React from "react";
import * as ReactDOM from "react-dom";

import "./css/index.css";

import { EverestUI } from "./components/EverestUI";

export const renderApp = (environment: any) => {
  ReactDOM.render(
      <EverestUI environment={environment} />,
      document.getElementById("everest-ui"),
  );
};
