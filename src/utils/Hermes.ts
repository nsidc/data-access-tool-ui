import * as io from "socket.io-client";

import { ISelectionCriteria } from "../types/OrderSubmissionParameters";
import { EverestUser, ILoggedInUser, isLoggedInUser } from "../types/User";

export interface IHermesAPI {
  getOrder: (orderId: string) => any;
  getUser: () => Promise<Response>;
  getUserOrders: (user: ILoggedInUser) => any;
  logoutUser: () => Promise<Response>;
  openNotificationConnection: (user: EverestUser, callback: any) => void;
  submitOrder: (user: EverestUser,
                selectionCriteria: ISelectionCriteria) => Promise<Response | null>;
}

// TODO: now that we don't depend on `inDrupal`, we could export a dict instead
// of this function
export function constructAPI(urls: any): IHermesAPI {
  const getOrder = (orderId: string) => {
    return fetch(`${urls.hermesApiUrl}/orders/${orderId}`, {credentials: "include"})
      .then((response) => response.json());
  };

  const getUserOrders = (user: ILoggedInUser) => {
    const url = `${urls.hermesApiUrl}/users/${user.uid}/orders/`;
    return fetch(url, {credentials: "include"})
      .then((response) => response.json())
      .then((orders) => orders.filter((order: any) => ["Everest", "Everest-dev"].includes(order.source_client)));
  };

  const openNotificationConnection = (user: EverestUser, callback: any) => {
    if (!isLoggedInUser(user)) { return; }

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
    user: EverestUser,
    selectionCriteria: ISelectionCriteria,
  ) => {
    if (!isLoggedInUser(user)) { return Promise.resolve(null); }

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

  const getUser = (): Promise<any> => {
    return fetch(
      `${urls.hermesApiUrl}/user/`,
      {
        credentials: "same-origin",
        method: "GET",
      },
    ).then((response: Response) => {
      if (!response.ok) { throw new Error('Network response was not ok'); }
        return response.json();
      })
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
