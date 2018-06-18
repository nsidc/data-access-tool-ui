declare var Drupal: any;

let HERMES_BASE_URL: string;
let HERMES_ORDER_URL: string;
let HERMES_USER_URL: string;
let PROFILE_URL: string;
let ORDER_NOTIFICATION_HOST: string;
let ORDER_NOTIFICATION_PATH: string;
let inDrupal: boolean;
let user: {[index: string]: string};

const getEnvironment = () => {
  const env: string = window.location.hostname.split(".")[0];
  if (["dev", "integration", "qa", "staging"].includes(env)) {
    return env;
  }
  return "production";
};

export const environment = getEnvironment();

if (typeof(Drupal) !== "undefined") {
  inDrupal = true;
  PROFILE_URL = "/order-history";
  HERMES_ORDER_URL = "/order-proxy";
  HERMES_USER_URL = HERMES_ORDER_URL;
  user = Drupal.settings.data_downloads.user;
  if (environment === "dev") {
    const devPostfix: string = window.location.hostname.split(".").slice(-5).join(".");
    HERMES_BASE_URL = `${window.location.hostname}`.replace("nsidc.org.drupal", "hermes");
    ORDER_NOTIFICATION_HOST = `wss://dev.hermes.${devPostfix}`;
    ORDER_NOTIFICATION_PATH = "/notification/";
  } else {
    HERMES_BASE_URL = `${window.location.hostname}/apps/orders`;
    ORDER_NOTIFICATION_HOST = `wss://${window.location.hostname}`;
    ORDER_NOTIFICATION_PATH = "/apps/order/notification/";
  }
} else {
  inDrupal = false;
  PROFILE_URL = "/profile.html";
  // Only populate and submit the user if we're not in the Drupal context. The
  // order proxy endpoint will inject the user in Drupal. This is a placeholder
  // username to hopefully avoid collisions with other users.
  user = {uid: "__everestui-standalone__"};
  HERMES_BASE_URL = `${window.location.hostname}`;
  HERMES_ORDER_URL = `https://${HERMES_BASE_URL}/api/orders/`;
  HERMES_USER_URL = `https://${HERMES_BASE_URL}/api/users/${user.uid}/orders/`;
  ORDER_NOTIFICATION_HOST = `wss://${HERMES_BASE_URL}`;
  ORDER_NOTIFICATION_PATH = "/notification/";
}

export { inDrupal };
export { user };
export { HERMES_BASE_URL };
export { HERMES_ORDER_URL };
export { HERMES_USER_URL };
export { ORDER_NOTIFICATION_HOST };
export { ORDER_NOTIFICATION_PATH };
export { PROFILE_URL };
