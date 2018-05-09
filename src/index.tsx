import * as fetch from "isomorphic-fetch";
import * as React from "react";
import * as ReactDOM from "react-dom";

import "./index.css";

import { EverestUI } from "./components/EverestUI";

const renderApp = () => {
  ReactDOM.render(
      <EverestUI />,
      document.getElementById("everest-ui")
  );
};

declare var Drupal: any;

// If the app is being rendered in Drupal, wait for the page to load first
if (typeof(Drupal) !== "undefined") {
  Drupal.behaviors.AppBehavior = {
    attach: function(context: any, settings: any) {
      renderApp();
    }
  };
} else {
  renderApp();
}
