import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactModal from "react-modal";

import "./css/index.css";

import { EverestUI } from "./components/EverestUI";

ReactModal.setAppElement("#everest-ui");

export const renderApp = (environment: any) => {
  ReactDOM.render(
      <EverestUI environment={environment} />,
      document.getElementById("everest-ui"),
  );
};
