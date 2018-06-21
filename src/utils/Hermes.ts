import * as io from "socket.io-client";

import { OrderTypes } from "../types/orderTypes";
import { IUser } from "../types/User";

export interface IHermesAPI {
    getOrder: (orderId: string) => any;
    getUserOrders: (user: IUser) => any;
    openNotificationConnection: (user: IUser, callback: any) => void ;
    submitOrder: (user: IUser, granuleURs: string[], collectionInfo: string[][], orderType: OrderTypes) => any;
}

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

export function constructAPI(urls: any, inDrupal: boolean): IHermesAPI {
    const getOrderInDrupal = (orderId: string) => {
        return fetch(urls.hermesOrderUrl, {credentials: "include"})
            .then((response) => response.json())
            .then((json) => json[orderId]);
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
        const url = `https://${urls.hermesBaseUrl}/api/users/${user.uid}/orders/`;

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
            console.log("Order notification: reconnected and rejoining");
            ws.emit("join", { userid: user.uid });
        });
        ws.on("notification", callback);
    };

    const submitOrder = (user: any, granuleURs: string[], collectionInfo: string[][], orderType: OrderTypes) => {
        const headers: any = {
            "Content-Type": "application/json",
        };
        let body: object = {
            collection_info: collectionInfo,
            granule_URs: granuleURs,
        };
        body = Object.assign(body, getOrderParamsByType(orderType));

        body = Object.assign(body, {user});

        return fetch(urls.hermesOrderUrl, {
            body: JSON.stringify(body),
            credentials: "include",
            headers,
            method: "POST",
        }).then((response) => response.json());
    };

    return {
        getOrder: inDrupal ? getOrderInDrupal : getOrderInStandalone,
        getUserOrders: inDrupal ? getUserOrdersInDrupal : getUserOrdersInStandalone,
        openNotificationConnection,
        submitOrder,
    };
}
