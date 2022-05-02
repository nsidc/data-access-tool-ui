import { shim } from "promise.prototype.finally";

import setupEnvironment from "./utils/environment";

declare var Drupal: any;

// existing application URL: https://nsidc.org/data/MOD10_L2/versions/61
// D9 application URL: /data/data-access-tool/MOD10_L2/versions/61
// D9 landing page URL: https://staging.example.nsidc.org/data/mod10_l2/versions/61
//
// parameters needed:
// authid
// version
// suggest URL like: nsidc.org/data/access/MOD10_L2/versions/61
//
// existing order history: https://nsidc.org/order-history note no query parameter!
// suggest nsidc.org/data/order-history
//   or    nsidc.org/data/access/order-history
//

shim(); // Get support for Promise.finally(). Can be replaced with Typescript 2.7+ and esnext
let renderUI: any;

// if (window['drupalSettings'] === void 0) {
//   window['drupalSettings'] = {};
// }
// if (name === 'doRoute' && window['drupalSettings'].keywords) {
//   args[0] = 'keywords=' + window['drupalSettings'].keywords;
// }
// @ts-ignore
window["CESIUM_BASE_URL"] = process.env.CESIUM_BASE_URL;

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
