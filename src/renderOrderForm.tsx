import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactModal from "react-modal";

import "./styles/index.less";

import { EverestUI } from "./components/EverestUI";

// Render an empty everest-container so that it can be passed to ReactModal
// before the whole app has rendered. The app element set here should not be a
// parent of the modal, which is set via ReactModal.parentSelector in
// e.g., EddFlow. With this setup, #everest-ui is a parent of both
// div#everest-container and div.ReactModalPortal.
//
// http://reactcommunity.org/react-modal/accessibility/#app-element
// http://reactcommunity.org/react-modal/#custom-parent
ReactDOM.render((<div id="everest-container" />), document.getElementById("order-data"));
ReactModal.setAppElement("#everest-container");

export const renderApp = (environment: any) => {
  ReactDOM.render(
    <EverestUI environment={environment} />,
    document.getElementById("order-data"),
  );
};
