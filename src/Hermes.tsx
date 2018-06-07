import { inDrupal } from "./environment";
import { HERMES_ORDER_URL, HERMES_USER_URL } from "./environment";
import { user } from "./environment";

export const submitOrder = (granuleURs: string[], collectionInfo: string[][]) => {
  const headers: any = {
    "Content-Type": "application/json",
  };
  let body: object = {
    collection_info: collectionInfo,
    destination: "archive",
    format: "files",
    granule_URs: granuleURs,
  };
  if (user) {
    body = Object.assign(body, {user});
  }

  return fetch(HERMES_ORDER_URL, {
    body: JSON.stringify(body),
    credentials: "include",
    headers,
    method: "POST",
  }).then((response) => response.json());
};

export const getUserOrders = () => {
  return fetch(HERMES_USER_URL, {credentials: "include"})
    .then((response) => response.json());
};

export const getOrder = (orderId: string) => {
  if (inDrupal) {
    // In Drupal, we use the proxy to get orders by user ID
    return fetch(HERMES_ORDER_URL, {credentials: "include"})
      .then((response) => response.json())
      .then((json) => json[orderId]);
  } else {
    return fetch(HERMES_ORDER_URL + orderId)
      .then((response) => response.json());
  }
};
