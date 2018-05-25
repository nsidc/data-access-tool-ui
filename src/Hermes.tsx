declare var Drupal: any;
let HERMES_ORDER_URL: string;
let user: {[index: string]: string};
if (typeof(Drupal) !== "undefined") {
  HERMES_ORDER_URL = "/order-proxy";
} else {
  user = {"uid": "foo"};
  HERMES_ORDER_URL = "https://dev.hermes.mfisher.dev.int.nsidc.org/api/order/";
}

export const submitOrder = (granuleURs: string[], collectionInfo: string[][]) => {
  let headers: any = {
    "Content-Type": "application/json",
  }
  let body: object = {
    destination: "archive",
    granule_URs: granuleURs,
    collection_info: collectionInfo,
    format: "",
  }
  // Only submit the user if we're not in the Drupal context. The proxy will
  // inject the user in Drupal
  if (user) {
    body = Object.assign(body, {user})
  }

  return fetch(HERMES_ORDER_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  }).then(response => response.json());
}

export const viewOrder = (orderId: string) => {
  return fetch(HERMES_ORDER_URL + orderId)
    .then(response => response.json())
}
