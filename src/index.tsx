declare var Drupal: any;

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
      return renderUI.renderApp();
    },
  };
} else {
  /* tslint:disable:no-var-requires */
  renderUI = require("./renderOrderForm");
  /* tslint:enable:no-var-requires */
  renderUI.renderApp();
}
