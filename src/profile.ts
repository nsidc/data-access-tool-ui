import { shim } from "promise.prototype.finally";

import setupEnvironment from "./utils/environment";
import { renderApp } from "./renderProfile";

declare var Drupal: any;

shim(); // Get support for Promise.finally(). Can be replaced with Typescript 2.7+ and esnext
renderApp((setupEnvironment()));
