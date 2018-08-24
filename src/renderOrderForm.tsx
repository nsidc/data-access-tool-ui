import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactModal from "react-modal";

import "./styles/index.less";

import { EverestUI } from "./components/EverestUI";

// http://reactcommunity.org/react-modal/accessibility/#app-element
ReactModal.setAppElement("#everest-ui");

export const renderApp = (environment: any) => {
  ReactDOM.render(
      <EverestUI environment={environment} />,
      document.getElementById("everest-ui"),
  );
};
