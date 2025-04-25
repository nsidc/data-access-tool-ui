import {IDrupalDataset} from "../types/DrupalDataset";

interface IUrls {
  datBackendApiUrl: string;
  hermesApiUrl: string;
  orderNotificationHost: string;
  orderNotificationPath: string;
}

export interface IEnvironment {
  drupalDataset?: IDrupalDataset;
  exposeFunction: (name: string, callback: (...args: any[]) => any) => boolean;
  inDrupal: boolean;
  // TODO: add dat-backend api url here.
  // TODO: consider adding a module for the dat API similar to Hermes.ts.
  urls: IUrls;
}

export function getEnvironment(): string {
  const env: string = window.location.hostname.split(".")[0];
  if (["localhost", "dev", "integration", "qa", "staging"].includes(env)) {
    return (env === "localhost") ? "dev" : env;
  }
  return "production";
}

function getEnvironmentDependentURLs() {
  // TODO: this function gives the same result in every case. Necessary?
  if (getEnvironment() === "dev") {
    return {
      datBackendApiUrl: "https://integration.nsidc.org/apps/data-access-tool/api",
      // TODO: these will all be removed with the decom of hermes.
      hermesApiUrl: "/apps/orders/api",
      orderNotificationHost: `wss://${window.location.hostname}`,
      orderNotificationPath: "/apps/orders/notification/",
    };
  } else {
    return {
      // Note: the backend API url must be fully specified for its use in the
      // EDD deep link (it cannot be relative to the root)
      datBackendApiUrl: `${window.location.protocol}//${window.location.host}/apps/data-access-tool/api`,
      // TODO: these will all be removed with the decom of hermes.
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
  const drupalSettings: {[key: string]: any} = (window as {[key: string]: any}).drupalSettings;

  if (typeof (drupalSettings) !== "undefined") {
    console.warn("Using drupalSettings:", drupalSettings);
    datasetFromDrupal = {
      id: drupalSettings.data_downloads?.dataset?.id,
      version: drupalSettings.data_downloads?.dataset?.version,
      title: '',
    };
    inDrupal = true;
  }

  const urls = {
    ...getEnvironmentDependentURLs(),
  };
  return {
    drupalDataset: datasetFromDrupal,
    exposeFunction,
    inDrupal,
    urls,
  };
}
