import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactModal from "react-modal";

import "./index.css";

import { EverestUI } from "./components/EverestUI";

const renderApp = () => {

  ReactModal.setAppElement("#everest-ui");
  ReactDOM.render(
      <EverestUI />,
      document.getElementById("everest-ui"),
  );
};

declare var Drupal: any;

if (typeof(Drupal) !== "undefined") {
  // By extending Drupal.behaviors with a new behavior and callback, we can
  // ensure that the "everest-ui" element exists before we render the app.
  Drupal.behaviors.AppBehavior = {
    attach: (context: any, settings: any) => renderApp(),
  };
} else {
  renderApp();
}
