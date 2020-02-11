import * as io from "socket.io-client";

import { ISelectionCriteria } from "../types/OrderSubmissionParameters";
import { IUser } from "../types/User";

export interface IHermesAPI {
  getOrder: (orderId: string) => any;
  getUser: () => any;
  getUserOrders: (user: IUser) => any;  // TODO: We probably don't need to pass user anymore here
  logoutUser: () => any;
  openNotificationConnection: (user: IUser, callback: any) => void;
  submitOrder: (user: IUser,
                selectionCriteria: ISelectionCriteria) => Promise<any>;
}

// TODO: now that we don't depend on `inDrupal`, we could export a dict instead
// of this function
export function constructAPI(urls: any): IHermesAPI {
  const getOrder = (orderId: string) => {
    return fetch(`${urls.hermesApiUrl}/orders/${orderId}`, {credentials: "include"})
      .then((response) => response.json());
  };

  const getUserOrders = (user: any) => {
    const url = `${urls.hermesApiUrl}/users/${user.uid}/orders/`;
    return fetch(url, {credentials: "include"})
      .then((response) => response.json())
      .then((orders) => orders.filter((order: any) => order.source_client === "Everest"));
  };

  const openNotificationConnection = (user: any, callback: any) => {
    const ws: any = io.connect(urls.orderNotificationHost, {
      path: urls.orderNotificationPath,
      transports: ["websocket", "polling"],
    });
    ws.emit("join", { user_id: user.uid });
    ws.on("reconnect", (event: any) => {
      // console.log("Order notification: reconnected and rejoining");
      ws.emit("join", { user_id: user.uid });
    });
    ws.on("notification", callback);
  };

  const submitOrder = (
    user: IUser,
    selectionCriteria: ISelectionCriteria,
  ) => {
    const headers: any = {
      "Content-Type": "application/json",
    };
    let body: object = {
      delivery: "esi",
      fulfillment: "esi",
      selection_criteria: {
        include_granules: selectionCriteria.includeGranules,
      },
    };

    body = Object.assign(body, {uid: user.uid, user});

    const url = `${urls.hermesApiUrl}/orders/`;
    return fetch(url, {
      body: JSON.stringify(body),
      credentials: "include",
      headers,
      method: "POST",
    });
  };

  const logoutUser = () => {
    return fetch(
      `${urls.hermesApiUrl}/earthdata/deauth/`,
      {
        credentials: "include",
        method: "GET",
      },
    );
  };

  const getUser = () => {
    return fetch(
      `${urls.hermesApiUrl}/user/`,
      {
        credentials: "include",
        method: "GET",
      },
    );
  };

  return {
    getOrder,
    getUser,
    getUserOrders,
    logoutUser,
    openNotificationConnection,
    submitOrder,
  };
}
