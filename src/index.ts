import { shim } from "promise.prototype.finally";

import setupEnvironment from "./utils/environment";

declare var Drupal: any;

// application url format: /data/data-access-tool/MOD10_L2/versions/61
// authid
// version

shim(); // Get support for Promise.finally(). Can be replaced with Typescript 2.7+ and esnext
let renderUI: any;
if (typeof(Drupal) !== "undefined") {
  // By extending Drupal.behaviors with a new behavior and callback, we can
  // ensure that the "everest-ui" element and required Drupal state exist
  // before we render the app or include dependencies.
  Drupal.behaviors.EverestUI = {
    attach: (context: any, settings: any) => {
      /* tslint:disable:no-var-requires */
      renderUI = require("./renderOrderForm");
      /* tslint:enable:no-var-requires */
      return renderUI.renderApp(setupEnvironment(true));
    },
  };
} else {
  /* tslint:disable:no-var-requires */
  renderUI = require("./renderOrderForm");
  /* tslint:enable:no-var-requires */
  renderUI.renderApp(setupEnvironment(false));
}
