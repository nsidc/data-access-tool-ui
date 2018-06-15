import * as React from "react";
import * as ReactDOM from "react-dom";

import "./index.css";

import { EverestUI } from "./components/EverestUI";

export const renderApp = () => {
  ReactDOM.render(
      <EverestUI />,
      document.getElementById("everest-ui"),
  );
};
