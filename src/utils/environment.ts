import { IUser } from "../types/User";
import { constructAPI, IHermesAPI } from "./Hermes";

declare var Drupal: any;

interface IURLs {
  hermesBaseUrl: string;
  orderNotificationHost: string;
  orderNotificationPath: string;
  hermesOrderUrl: string;
  profileURL: string;
}

export interface IEnvironment {
  hermesAPI: IHermesAPI;
  urls: IURLs;
  user: IUser;
}

const getEnvironment = () => {
  const env: string = window.location.hostname.split(".")[0];
  if (["dev", "integration", "qa", "staging"].includes(env)) {
    return env;
  }
  return "production";
};

function getEnvironmentDependentURLs() {
  if (getEnvironment() === "dev") {
    const devPostfix: string = window.location.hostname.split(".").slice(-5).join(".");
    return {
      hermesBaseUrl: `${window.location.hostname}`.replace("nsidc.org.drupal", "hermes"),
      orderNotificationHost: `wss://dev.hermes.${devPostfix}`,
      orderNotificationPath: "/notification/",
    };
  } else {
    return {
      hermesBaseUrl: `${window.location.hostname}/apps/orders`,
      orderNotificationHost: `wss://${window.location.hostname}`,
      orderNotificationPath: "/apps/order/notification/",
    };
  }
}

export default function setupEnvironment(inDrupal: boolean): IEnvironment {
  let hermesBaseUrl: string;
  if (inDrupal) {
    const urls = {
      ...getEnvironmentDependentURLs(),
      hermesOrderUrl: "/order-proxy",
      profileURL: "/order-history",
    };
    return {
      hermesAPI: constructAPI(urls, true),
      urls,
      user: Drupal.settings.data_downloads.user,  // TODO: Use the Eardata Login module function?
    };
  } else {
    hermesBaseUrl = `${window.location.hostname}`;
    const user = {uid: "__everestui-standalone__"};
    const urls = {
      ...getEnvironmentDependentURLs(),
      hermesOrderUrl: `https://${hermesBaseUrl}/api/orders/`,
      profileURL: "/profile.html",
    };
    return {
      hermesAPI: constructAPI(urls, false),
      urls,
      user,
    };
  }
}
