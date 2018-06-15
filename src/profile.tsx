import * as React from "react";
import * as ReactDOM from "react-dom";

import "./index.css";

import { EverestProfile } from "./components/EverestProfile";

const renderApp = () => {
  ReactDOM.render(
      <EverestProfile />,
      document.getElementById("everest-ui-profile"),
  );
};

declare var Drupal: any;

if (typeof(Drupal) !== "undefined") {
  // By extending Drupal.behaviors with a new behavior and callback, we can
  // ensure that the "everest-ui-profile" element exists before we render the
  // app.
  Drupal.behaviors.AppBehavior = {
    attach: (context: any, settings: any) => renderApp(),
  };
} else {
  renderApp();
}
