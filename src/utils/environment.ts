import { IDrupalDataset } from "../types/DrupalDataset";
import { constructAPI, IHermesAPI } from "./Hermes";

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
}

export function getEnvironment(): string {
  const env: string = window.location.hostname.split(".")[0];
  if (["localhost", "dev", "integration", "qa", "staging"].includes(env)) {
    return env;
  }
  return "production";
}

function getEnvironmentDependentURLs() {
  if (getEnvironment() === "dev") {
    const devPostfix: string = window.location.hostname.split(".").slice(-5).join(".");
    return {
      hermesApiUrl: `https://dev.hermes.${devPostfix}/api`,
      orderNotificationHost: `wss://dev.hermes.${devPostfix}`,
      orderNotificationPath: "/notification/",
    };
  } else {
    return {
      hermesApiUrl: "/apps/orders/api",
      orderNotificationHost: `wss://${window.location.hostname}`,
      orderNotificationPath: "/apps/orders/notification/",
    };
  }
}

export default function setupEnvironment(): IEnvironment {
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

  let datasetFromDrupal: IDrupalDataset | undefined;
  let inDrupal: boolean = false;
  let profileLocation: string = "/order-history.html";
  const drupalSettings: { [key: string]: any} = (window as { [key: string]: any }).drupalSettings;

  // if drupalSettings.auth-id?
  if (typeof(drupalSettings) !== "undefined") {
    datasetFromDrupal = {
      id: drupalSettings["auth-id"],
      version: drupalSettings.version,
      title: '',
    };
    profileLocation = "/order-history";
    inDrupal = true;
  }

  // TODO profileUrl needs to include user id if it exists.
  const urls = {
    ...getEnvironmentDependentURLs(),
    profileUrl: profileLocation,
  };
  return {
    drupalDataset: datasetFromDrupal,
    exposeFunction,
    hermesAPI: constructAPI(urls),
    inDrupal,
    urls,
  };
}
