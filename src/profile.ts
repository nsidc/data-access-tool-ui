declare var Drupal: any;

let renderProfile: any;
if (typeof(Drupal) !== "undefined") {
  // By extending Drupal.behaviors with a new behavior and callback, we can
  // ensure that the "everest-ui-profile" element and required Drupal state
  // exist before we render the app or include dependencies.
  Drupal.behaviors.EverestProfile = {
    attach: (context: any, settings: any) => {
      /* tslint:disable:no-var-requires */
      renderProfile = require("./renderProfile");
      /* tslint:enable:no-var-requires */
      return renderProfile.renderApp();
    },
  };
} else {
  /* tslint:disable:no-var-requires */
  renderProfile = require("./renderProfile");
  /* tslint:enable:no-var-requires */
  renderProfile.renderApp();
}
