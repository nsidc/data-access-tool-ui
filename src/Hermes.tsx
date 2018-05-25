declare var Drupal: any;
let HERMES_ORDER_URL: string;
let user: {[index: string]: string};
if (typeof(Drupal) !== "undefined") {
  HERMES_ORDER_URL = "/order-proxy";
} else {
  user = {uid: "foo"};
  HERMES_ORDER_URL = "https://dev.hermes.mfisher.dev.int.nsidc.org/api/order/";
}

export const submitOrder = (granuleURs: string[], collectionInfo: string[][]) => {
  const headers: any = {
    "Content-Type": "application/json",
  };
  let body: object = {
    collection_info: collectionInfo,
    destination: "archive",
    format: "",
    granule_URs: granuleURs,
  };
  // Only submit the user if we're not in the Drupal context. The proxy will
  // inject the user in Drupal
  if (user) {
    body = Object.assign(body, {user});
  }

  return fetch(HERMES_ORDER_URL, {
    body: JSON.stringify(body),
    headers,
    method: "POST",
  }).then((response) => response.json());
};

export const viewOrder = (orderId: string) => {
  const uid: string = user.uid;
  return fetch(HERMES_ORDER_URL + uid)
    .then((response) => response.json())
    .then((json) => json[orderId]);
};
