import { shim } from "promise.prototype.finally";

import setupEnvironment from "./utils/environment";

declare var Drupal: any;

shim(); // Get support for Promise.finally(). Can be replaced with Typescript 2.7+ and esnext
let renderProfile: any;
if (typeof(Drupal) !== "undefined") {
  // By extending Drupal.behaviors with a new behavior and callback, we can
  // ensure that the "order-history" element and required Drupal state
  // exist before we render the app or include dependencies.
  Drupal.behaviors.EverestProfile = {
    attach: (context: any, settings: any) => {
      /* tslint:disable:no-var-requires */
      renderProfile = require("./renderProfile");
      /* tslint:enable:no-var-requires */
      return renderProfile.renderApp(setupEnvironment(true));
    },
  };
} else {
  /* tslint:disable:no-var-requires */
  renderProfile = require("./renderProfile");
  /* tslint:enable:no-var-requires */
  renderProfile.renderApp(setupEnvironment(false));
}
