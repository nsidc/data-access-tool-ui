import * as React from "react";

import { OrderParameters, GranuleSorting } from "../../types/OrderParameters";
import { EddHandoffButton } from "../EddHandoffButton";
import { cmrGranuleParams } from "../../utils/CMR";
import { CmrCollection } from "../../types/CmrCollection";

interface IEddOrderConfirmationProps {
  onCancel: () => void;
  orderParameters: OrderParameters;
}


const eddDeepLinkFromOrderParams = (orderParameters: OrderParameters) => {
  const getLinksUrl = buildGetLinksUrl(orderParameters.collection.short_name,
                                            orderParameters.collection.version_id,
                                            orderParameters.collection.provider,
                                            orderParameters.boundingBox,
                                            orderParameters.spatialSelection,
                                            orderParameters.temporalFilterLowerBound,
                                            orderParameters.temporalFilterUpperBound,
                                            orderParameters.cmrGranuleFilter);
    const eddDeepLink = buildEddDeepLink(
      getLinksUrl,
      orderParameters.collection.short_name,
      orderParameters.collection.version_id,
    );

    return eddDeepLink;
}


const buildGetLinksUrl = (short_name: CmrCollection["short_name"],
                            version: CmrCollection["version_id"],
                            provider: CmrCollection["provider"],
                            boundingBox: OrderParameters["boundingBox"],
                            spatialSelection: OrderParameters["spatialSelection"],
                            temporalStart: OrderParameters["temporalFilterLowerBound"],
                            temporalEnd: OrderParameters["temporalFilterUpperBound"],
                            cmrGranuleFilter: OrderParameters["cmrGranuleFilter"]) => {

  const params = cmrGranuleParams(
      short_name,
      Number(version),
      provider,
      spatialSelection,
      boundingBox,
      temporalStart,
      temporalEnd,
      cmrGranuleFilter,
      GranuleSorting.StartTimeDown,
  );

  const url_encoded_params = encodeURIComponent(params);

  // TODO: parameterize this url based on env or some other mechanism.
  const url = `https://integration.nsidc.org/apps/data-access-tool/api/get-links?cmr_request_params=${url_encoded_params}`;

  const url_encoded_url = encodeURI(url);

  return url_encoded_url;
}

const buildEddDeepLink = (get_links_url: any, collection_short_name: any, collection_version: any) => {
  const client_id = `data_access_tool`;
  // TODO: parameterize this url based on env or some other mechanism.
  const auth_url = `https://integration.nsidc.org/apps/data-access-tool/api/earthdata/auth?eddRedirect=earthdata-download%3A%2F%2FauthCallback`;
  const download_id = `${collection_short_name}_${collection_version}`;

  const edd_deep_link = `earthdata-download://startDownload?getLinks=${get_links_url}`
                        + `&clientId=${client_id}&authUrl=${auth_url}&downloadId=${download_id}`;

  return edd_deep_link;
}

export const EddOrderConfirmation = (props: IEddOrderConfirmationProps) => {
  const edd_deeplink = eddDeepLinkFromOrderParams(props.orderParameters);
  window.open(edd_deeplink, "_self"); 
  return (
    <div style={{display: "flex"}}>
      <span style={{width: "50%"}}>
        <h2>Opening Earthdata Download to download your files...</h2>

        <p>
          Click <strong>Open Earthdata Download </strong>
          in the dialog presented by your browser.
          If the dialog does not open automatically, click
          <strong> Open Earthdata Download </strong> below.
          You can close this window once your download begins.
        </p>

        <p>
          Don’t have Earthdata Download installed? Go To the
          <a href="https://nasa.github.io/earthdata-download/" target="blank"
          > Downloads Page</a>.
        </p>

        <div style={{display: "flex"}}>

          <EddHandoffButton
            onClick={props.onCancel}
            eddDeeplink={edd_deeplink} />

          <button className="cancel-button eui-btn--red"
                  onClick={props.onCancel}>
            Close
          </button>

        </div>
      </span>
    </div>
  );
};

(EddOrderConfirmation as React.SFC).displayName = "EddOrderConfirmation";
