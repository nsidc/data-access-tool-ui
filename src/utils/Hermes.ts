import { List } from "immutable";
import * as io from "socket.io-client";

import { ISelectionCriteria } from "../types/OrderSubmissionParameters";
import { OrderTypes } from "../types/orderTypes";
import { IUser } from "../types/User";

export interface IHermesAPI {
  getOrder: (orderId: string) => any;
  getUserOrders: (user: IUser) => any;
  openNotificationConnection: (user: IUser, callback: any) => void;
  submitOrder: (user: IUser,
                selectionCriteria: ISelectionCriteria,
                collectionInfo: List<List<string>>,
                orderType: OrderTypes) => Promise<any>;
}

const getOrderParamsByType = (orderType: OrderTypes): any => {
  if ([OrderTypes.listOfLinks, OrderTypes.zipFile].includes(orderType)) {
    return {
      delivery: "esi",
      fulfillment: "esi",
    };
  }
};

export function constructAPI(urls: any, inDrupal: boolean): IHermesAPI {
  const getOrderInDrupal = (orderId: string) => {
    return fetch(`https://${urls.hermesBaseUrl}/api-v4/orders/${orderId}`)
      .then((response) => response.json());
  };

  const getOrderInStandalone = (orderId: string) => {
    return fetch(urls.hermesOrderUrl + orderId)
      .then((response) => response.json());
  };

  const getUserOrdersInDrupal = (user: any) => {
    return fetch(urls.hermesOrderUrl, {credentials: "include"})
      .then((response) => response.json());
  };

  const getUserOrdersInStandalone = (user: any) => {
    const url = `https://${urls.hermesBaseUrl}/api-v4/users/${user.uid}/orders/`;

    return fetch(url, {credentials: "include"})
      .then((response) => response.json());
  };

  const openNotificationConnection = (user: any, callback: any) => {
    const ws: any = io.connect(urls.orderNotificationHost, {
      path: urls.orderNotificationPath,
      transports: ["websocket", "polling"],
    });
    ws.emit("join", { userid: user.uid });
    ws.on("reconnect", (event: any) => {
      // console.log("Order notification: reconnected and rejoining");
      ws.emit("join", { userid: user.uid });
    });
    ws.on("notification", callback);
  };

  const submitOrder = (
    user: IUser,
    selectionCriteria: ISelectionCriteria,
    collectionInfo: List<List<string>>,
    orderType: OrderTypes,
  ) => {
    const headers: any = {
      "Content-Type": "application/json",
    };
    let body: object = {
      collection_info: collectionInfo,
      selection_criteria: {
        include_granules: selectionCriteria.includeGranules,
      },
    };
    body = Object.assign(body, getOrderParamsByType(orderType));

    const uid = user.uid;
    body = Object.assign(body, {uid, user});

    return fetch(urls.hermesOrderUrl, {
      body: JSON.stringify(body),
      credentials: "include",
      headers,
      method: "POST",
    });
  };

  return {
    getOrder: inDrupal ? getOrderInDrupal : getOrderInStandalone,
    getUserOrders: inDrupal ? getUserOrdersInDrupal : getUserOrdersInStandalone,
    openNotificationConnection,
    submitOrder,
  };
}
