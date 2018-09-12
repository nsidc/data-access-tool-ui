import { IUser } from "../types/User";
import { constructAPI, IHermesAPI } from "./Hermes";

declare var Drupal: any;

interface IUrls {
  hermesBaseUrl: string;
  orderNotificationHost: string;
  orderNotificationPath: string;
  hermesOrderUrl: string;
  profileUrl: string;
  hermesScriptUrl: string;
}

export interface IDrupalDataset {
  title: string;
  id: string;
  version: string;
}

export interface IEnvironment {
  drupalDataset?: IDrupalDataset;
  hermesAPI: IHermesAPI;
  inDrupal: boolean;
  urls: IUrls;
  user: IUser;
}

export function getEnvironment(): string {
  const env: string = window.location.hostname.split(".")[0];
  if (["dev", "integration", "qa", "staging"].includes(env)) {
    return env;
  }
  return "production";
}

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
      orderNotificationPath: "/apps/orders/notification/",
    };
  }
}

export default function setupEnvironment(inDrupal: boolean): IEnvironment {
  if (inDrupal) {
    const urls = {
      ...getEnvironmentDependentURLs(),
      hermesOrderUrl: "/order-proxy",
      hermesScriptUrl: "/script-proxy",
      profileUrl: "/order-history",
    };
    return {
      drupalDataset: Drupal.settings.data_downloads.dataset,
      hermesAPI: constructAPI(urls, true),
      inDrupal,
      urls,
      user: Drupal.settings.data_downloads.user,  // TODO: Use the Earthdata Login module function?
    };
  } else {
    const hermesBaseUrl = `${window.location.hostname}`;
    const urls = {
      ...getEnvironmentDependentURLs(),
      hermesOrderUrl: `https://${hermesBaseUrl}/api/orders/`,
      hermesScriptUrl: `https://${hermesBaseUrl}/api/downloader-script/`,
      profileUrl: "/profile.html",
    };
    return {
      drupalDataset: undefined,
      hermesAPI: constructAPI(urls, false),
      inDrupal,
      urls,
      user: {uid: "__everestui-standalone__"},
    };
  }
}
