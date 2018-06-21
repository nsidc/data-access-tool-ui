import * as io from "socket.io-client";

import { OrderTypes } from "../types/orderTypes";
import { inDrupal } from "./environment";
import { HERMES_ORDER_URL, HERMES_USER_URL } from "./environment";
import { ORDER_NOTIFICATION_HOST, ORDER_NOTIFICATION_PATH } from "./environment";
import { user } from "./environment";

const getOrderParamsByType = (orderType: OrderTypes): any => {
  if (orderType === OrderTypes.listOfLinks) {
    return {
      destination: "archive",
      format: "files",
    };
  } else if (orderType === OrderTypes.zipFile) {
    return {
      destination: "archive",
      format: "",
    };
  }
};

export const submitOrder = (granuleURs: string[], collectionInfo: string[][], orderType: OrderTypes) => {
  const headers: any = {
    "Content-Type": "application/json",
  };
  let body: object = {
    collection_info: collectionInfo,
    granule_URs: granuleURs,
  };
  body = Object.assign(body, getOrderParamsByType(orderType));

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

export const openNotificationConnection = (callback: any) => {
  const ws: any = io.connect(ORDER_NOTIFICATION_HOST, {
    path: ORDER_NOTIFICATION_PATH,
    transports: ["websocket", "polling"],
  });
  ws.emit("join", { userid: user.uid });
  ws.on("reconnect", (event: any) => {
    console.log("Order notification: reconnected and rejoining");
    ws.emit("join", { userid: user.uid });
  });
  ws.on("notification", callback);
};
