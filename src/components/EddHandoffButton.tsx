import * as React from "react";

import { CmrCollection } from "../types/CmrCollection";
import { OrderParameters, GranuleSorting } from "../types/OrderParameters";
import { cmrGranuleParams } from "../utils/CMR";
import { hasChanged } from "../utils/hasChanged";

interface IHandoffButtonProps {
  onClick: () => void;
  orderParameters: OrderParameters;
}

export class EddHandoffButton extends React.Component<IHandoffButtonProps> {
  public constructor(props: IHandoffButtonProps) {
    super(props);

    this.state = {
      loading: false,
    };
  }

  public shouldComponentUpdate(nextProps: IHandoffButtonProps) {
    const propsChanged = hasChanged(this.props, nextProps, ["orderParameters"]);

    return propsChanged;
  }

  public render() {
    return (
      <button
        id="confirmEdd"
        type="button"
        className="handoff-button eui-btn--blue"
        onClick={() => {
          this.edscRedirect(this.props.orderParameters);
          this.props.onClick();
          }}>
        OK
      </button>
    );
  }

  private edscRedirect = (orderParameters: OrderParameters) => {
    const getLinksUrl = this.buildGetLinksUrl(orderParameters.collection.short_name,
                                              orderParameters.collection.version_id,
                                              orderParameters.collection.provider,
                                              orderParameters.boundingBox,
                                              orderParameters.spatialSelection,
                                              orderParameters.temporalFilterLowerBound,
                                              orderParameters.temporalFilterUpperBound,
                                              orderParameters.cmrGranuleFilter);
      const eddDeepLink = this.buildEddDeepLink(
        getLinksUrl,
        orderParameters.collection.short_name,
        orderParameters.collection.version_id,
      );

      console.log(`Using deep link: ${eddDeepLink}`)

    window.open(eddDeepLink, "_blank");
  }

  private buildGetLinksUrl = (short_name: CmrCollection["short_name"],
                              version: CmrCollection["version_id"],
                              provider: CmrCollection["provider"],
                              boundingBox: OrderParameters["boundingBox"],
                              spatialSelection: OrderParameters["spatialSelection"],
                              temporalStart: OrderParameters["temporalFilterLowerBound"],
                              temporalEnd: OrderParameters["temporalFilterUpperBound"],
                              cmrGranuleFilter: OrderParameters["cmrGranuleFilter"]) => {

    let params = cmrGranuleParams(
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

    let url_encoded_params = encodeURIComponent(params);

    // TODO: parameterize this url based on env or some other mechanism.
    let url = `https://integration.nsidc.org/apps/data-access-tool/api/get-links?cmr_request_params=${url_encoded_params}`;
        
    let url_encoded_url = encodeURI(url);

    return url_encoded_url;
  }

  private buildEddDeepLink = (get_links_url: any, collection_short_name: any, collection_version: any) => {
    let client_id = `data_access_tool`;
    // TODO: parameterize this url based on env or some other mechanism.
    let auth_url = `https://integration.nsidc.org/apps/data-access-tool/api/earthdata/auth?eddRedirect=earthdata-download%3A%2F%2FauthCallback`;
    let download_id = `${collection_short_name}_${collection_version}`;

    let edd_deep_link = `earthdata-download://startDownload?getLinks=${get_links_url}&clientId=${client_id}&authUrl=${auth_url}&downloadId=${download_id}`;

    return edd_deep_link;
  }
}
