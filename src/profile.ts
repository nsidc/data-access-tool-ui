declare var Drupal: any;

import { renderApp } from "./renderProfile";

if (typeof(Drupal) !== "undefined") {
  // By extending Drupal.behaviors with a new behavior and callback, we can
  // ensure that the "everest-ui-profile" element and required Drupal state
  // exist before we render the app or include dependencies.
  Drupal.behaviors.EverestProfile = {
    attach: (context: any, settings: any) => renderApp(),
  };
} else {
  renderApp();
}
