declare var Drupal: any;

let HERMES_ORDER_URL: string;
let HERMES_USER_URL: string;
let ORDER_NOTIFICATION_URL: string;
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
  HERMES_ORDER_URL = "/order-proxy";
  HERMES_USER_URL = HERMES_ORDER_URL;
  if (environment === "dev") {
    const devPostfix: string = window.location.hostname.split(".").slice(-5).join(".");
    ORDER_NOTIFICATION_URL = `dev.hermes.${devPostfix}`;
  } else {
    ORDER_NOTIFICATION_URL = `${window.location.origin}/apps/order/notification`;
  }
} else {
  inDrupal = false;
  // Only populate and submit the user if we're not in the Drupal context. The
  // order proxy endpoint will inject the user in Drupal. This is a placeholder
  // username to hopefully avoid collisions with other users.
  user = {uid: "__everestui-standalone__"};
  const HERMES_BASE_URL: string = `https://${window.location.hostname}`;
  HERMES_ORDER_URL = `${HERMES_BASE_URL}/api/orders/`;
  HERMES_USER_URL = `${HERMES_BASE_URL}/api/users/${user.uid}/orders/`;
  ORDER_NOTIFICATION_URL = `${HERMES_BASE_URL}/notification/`;
}

export { inDrupal };
export { ORDER_NOTIFICATION_URL };
export { HERMES_ORDER_URL };
export { HERMES_USER_URL };
export { user };
