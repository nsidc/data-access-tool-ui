import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactModal from "react-modal";

import "./index.css";

import { EverestUI } from "./components/EverestUI";
import { inDrupal } from "./environment";

declare var Drupal: any;

const renderApp = () => {
  ReactModal.setAppElement("#everest-ui");
  ReactDOM.render(
      <EverestUI />,
      document.getElementById("everest-ui"),
  );
};

if (inDrupal) {
  // By extending Drupal.behaviors with a new behavior and callback, we can
  // ensure that the "everest-ui" element exists before we render the app.
  Drupal.behaviors.AppBehavior = {
    attach: (context: any, settings: any) => renderApp(),
  };
} else {
  renderApp();
}
