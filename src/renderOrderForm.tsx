import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactModal from "react-modal";

import "./index.css";

import { EverestUI } from "./components/EverestUI";

export const renderApp = () => {
  ReactModal.setAppElement("#everest-ui");
  ReactDOM.render(
      <EverestUI />,
      document.getElementById("everest-ui"),
  );
};
