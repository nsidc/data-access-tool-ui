declare var Drupal: any;

import { renderApp } from "./renderOrderForm";

if (typeof(Drupal) !== "undefined") {
  // By extending Drupal.behaviors with a new behavior and callback, we can
  // ensure that the "everest-ui" element and required Drupal state exist
  // before we render the app or include dependencies.
  Drupal.behaviors.EverestUI = {
    attach: (context: any, settings: any) => renderApp(),
  };
} else {
  renderApp();
}
