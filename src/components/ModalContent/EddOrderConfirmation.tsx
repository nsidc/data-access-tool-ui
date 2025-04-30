import * as React from "react";

import { hasChanged } from "../../utils/hasChanged";
import { OrderParameters, GranuleSorting } from "../../types/OrderParameters";
import { EddHandoffButton } from "../EddHandoffButton";
import { cmrGranuleParams } from "../../utils/CMR";
import { CmrCollection } from "../../types/CmrCollection";
import { IEnvironment } from "../../utils/environment";

import "../../styles/eui_buttons.less";

interface IEddOrderConfirmationProps {
  onCancel: () => void;
  orderParameters: OrderParameters;
  environment: IEnvironment;
}


const eddDeepLinkFromOrderParams = (orderParameters: OrderParameters, environment: IEnvironment) => {
    const getLinksUrl = buildGetLinksUrl(
        orderParameters.collection.short_name,
        orderParameters.collection.version_id,
        orderParameters.collection.provider,
        orderParameters.boundingBox,
        orderParameters.spatialSelection,
        orderParameters.temporalFilterLowerBound,
        orderParameters.temporalFilterUpperBound,
        orderParameters.cmrGranuleFilter,
        environment,
    );
    const eddDeepLink = buildEddDeepLink(
      getLinksUrl,
      orderParameters.collection.short_name,
      orderParameters.collection.version_id,
      environment,
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
                          cmrGranuleFilter: OrderParameters["cmrGranuleFilter"],
                          environment: IEnvironment,
) => {

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

  const url = `${environment.urls.datBackendApiUrl}/get-links?cmr_request_params=${url_encoded_params}`;

  const url_encoded_url = encodeURI(url);

  return url_encoded_url;
}

const buildEddDeepLink = (get_links_url: any, collection_short_name: any, collection_version: any, environment: IEnvironment) => {
  const client_id = `data_access_tool`;
  const auth_url = `${environment.urls.datBackendApiUrl}/earthdata/auth?eddRedirect=earthdata-download%3A%2F%2FauthCallback`;
  const download_id = `${collection_short_name}_${collection_version}`;

  const edd_deep_link = `earthdata-download://startDownload?getLinks=${get_links_url}`
                        + `&clientId=${client_id}&authUrl=${auth_url}&downloadId=${download_id}`;

  return edd_deep_link;
}


export class EddOrderConfirmation extends React.Component<IEddOrderConfirmationProps> {

  public shouldComponentUpdate(nextProps: IEddOrderConfirmationProps) {
    const propsChanged = hasChanged(this.props, nextProps, ["onCancel", "orderParameters"]);

    return propsChanged;
  }

    public render() {
      const edd_deeplink = eddDeepLinkFromOrderParams(this.props.orderParameters, this.props.environment);
      window.open(edd_deeplink, "_self");
      return (
        <div style={{display: "flex"}}>
          <span style={{width: "100%", padding: "0.5em"}}>
            <h2>Opening Earthdata Download to download your files...</h2>

            <p>
              Click <strong>Open Earthdata Download </strong>
              in the dialog presented by your browser.
              If the dialog does not open automatically, click
              <strong> Open Earthdata Download </strong> below.
              If you click and nothing happens, you may need download and
              install the Earthdata Download application. You can close this
              window once your download begins.
            </p>

            <p>
              Don’t have Earthdata Download installed? Go To the
              <a href="https://nasa.github.io/earthdata-download/" target="blank"
              > Downloads Page</a>.
            </p>

            <div style={{display: "flex"}}>

              <EddHandoffButton
                onClick={this.props.onCancel}
                eddDeeplink={edd_deeplink} />

              <button className="cancel-button eui-btn--red modal-button"
                      onClick={this.props.onCancel}>
                Close
              </button>

            </div>
          </span>
        </div>
      );
    }

}
