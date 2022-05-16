import { shim } from "promise.prototype.finally";

import setupEnvironment from "./utils/environment";
import { renderApp } from "./renderOrderForm";

let datasetAuthId: string | null = null;
let datasetVersion: string | null = null;
let drupalSettings: { [key: string]: any};

// Ignore these random notes to self while app migration is still in progress...
// but TODO remove them before merging this branch!
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
let inDrupal: boolean;

// @ts-ignore
window["CESIUM_BASE_URL"] = process.env.CESIUM_BASE_URL;
drupalSettings = (window as { [key: string]: any })["drupalSettings"];
inDrupal = false;

if (drupalSettings !== void 0) {
  datasetAuthId = drupalSettings['auth-id'];
  datasetVersion = drupalSettings['version'];
  inDrupal = true;
}

renderApp(setupEnvironment(inDrupal), datasetAuthId, datasetVersion);
