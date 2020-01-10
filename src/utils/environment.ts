import { IDrupalDataset } from "../types/DrupalDataset";
import { IUser } from "../types/User";
import { constructAPI, IHermesAPI } from "./Hermes";

declare var Drupal: any;

interface IUrls {
  hermesApiUrl: string;
  orderNotificationHost: string;
  orderNotificationPath: string;
  profileUrl: string;
}

export interface IEnvironment {
  drupalDataset?: IDrupalDataset;
  exposeFunction: (name: string, callback: (...args: any[]) => any) => boolean;
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
      hermesApiUrl: `https://dev.hermes2.${devPostfix}`,
      orderNotificationHost: `wss://dev.hermes2.${devPostfix}`,
      orderNotificationPath: "/notification/",
    };
  } else {
    return {
      hermesApiUrl: `https://${window.location.hostname}`,
      orderNotificationHost: `wss://${window.location.hostname}`,
      orderNotificationPath: "/apps/orders/notification2/",
    };
  }
}

export default function setupEnvironment(inDrupal: boolean): IEnvironment {
  const exposeFunction = (name: string, callback: (...args: any[]) => any): boolean => {
    if (!["dev", "integration"].includes(getEnvironment())) {
      return false;
    }

    if (window.hasOwnProperty(name)) {
      console.warn(`Attempted to add function ${name} to window; property already exists on window.`);
      return false;
    } else {
      // @ts-ignore 7017 - TypeScript doesn't recognize the `window` as being
      // able to take square brackets, so ignore its complaints.
      //
      // Also note that modifying `window` in this way is traditionally a Bad
      // Thing, which is why we do this only in dev and integration environments
      // and take care not to overwrite any existing properties.
      window[name] = callback;
      return true;
    }
  };

  if (inDrupal) {
    const urls = {
      ...getEnvironmentDependentURLs(),
      profileUrl: "/order-history",
    };
    return {
      drupalDataset: Drupal.settings.data_downloads.dataset,
      exposeFunction,
      hermesAPI: constructAPI(urls),
      inDrupal, // TODO: Can we kill you?
      urls,
      user: Drupal.settings.data_downloads.user,  // TODO: Use the Earthdata Login module function?
    };
  } else {
    const urls = {
      ...getEnvironmentDependentURLs(),
      profileUrl: "/profile.html",
    };
    return {
      drupalDataset: undefined,
      exposeFunction,
      hermesAPI: constructAPI(urls),
      inDrupal,
      urls,
      user: {uid: "__everestui-standalone__"},
    };
  }
}
