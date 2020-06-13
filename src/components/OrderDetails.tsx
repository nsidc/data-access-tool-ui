import * as moment from "moment";
import * as React from "react";

import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { UserContext } from "../utils/state";
import { LoadingIcon } from "./LoadingIcon";
import { getOrderStatus } from "./OrderListItem";

export interface IOrderDetailsProps {
  environment: IEnvironment;
  initialLoadComplete?: boolean;
  orderId?: string;
}

export interface IOrderDetailsState {
  loading: boolean;
  order?: any;
}

export class OrderDetails extends React.Component<IOrderDetailsProps, IOrderDetailsState> {
  public static contextType = UserContext;
  private static timeFormat = "l LT";

  public constructor(props: any) {
    super(props);

    this.state = {
      loading: false,
      order: undefined,
    };
  }

  public shouldComponentUpdate(nextProps: IOrderDetailsProps, nextState: IOrderDetailsState) {
    const stateChanged = hasChanged(this.state, nextState, ["order", "loading"]);
    const propsChanged = hasChanged(this.props, nextProps, ["initialLoadComplete", "orderId"]);
    return stateChanged || propsChanged;
  }

  public render() {
    const loading = !this.props.initialLoadComplete || this.state.loading;
    const noOrderSelected = !this.state.order;

    if (loading) {
      return (
        <div id="order-details"><LoadingIcon size="lg" /></div>
      );
    } else if (noOrderSelected) {
      return (
        <div id="order-details">{"Select an order from the list above to see details."}</div>
      );
    } else {
      const order: any = this.state.order;

      let links = null;
      // Show a mock expiration timestamp based on completed timestamp
      const expirationTimestamp = this.expirationTimestamp(order);
      if (expirationTimestamp && expirationTimestamp.isBefore(moment.now())) {
        links = (
          <div>
            <b>Expired:</b> {expirationTimestamp.format(OrderDetails.timeFormat)}
          </div>
        );
      } else {
        const dataLinks = this.buildDataLinks(order);
        const zipLinks = this.buildZipLinks(order);
        const textFileLinks: any = this.buildTextFileLink(order);
        const expirationJSX = expirationTimestamp ?
          (<div><b>Expires:</b> {expirationTimestamp.format(OrderDetails.timeFormat)}</div>) :
          null;
        links = (
          <div>
            {expirationJSX}
            <div><b>Zip links:</b> (download may take a moment to start)
              <ul>{zipLinks}</ul>
            </div>
            <div><b>File list:</b>
              <ul>{textFileLinks}</ul>
            </div>
            <div><b>File links:</b>
              <ul>{dataLinks}</ul>
            </div>
          </div>
        );
      }

      return (
        <div id="order-details">
          <div><b>Order ID:</b>&nbsp;{order.order_id}</div>
          <div><b>Status:</b>&nbsp;{getOrderStatus(order.status)}</div>
          <div><b>Submitted:</b>&nbsp;
            {moment(order.submitted_timestamp).format(OrderDetails.timeFormat)}
          </div>
          {this.completedTimestampJSX(order)}
          {links}
        </div>
      );
    }
  }

  public componentDidMount() {
    this.props.environment.hermesAPI.openNotificationConnection(this.context.user,
                                                                this.handleNotification);
  }

  public componentDidUpdate() {
    const orderSynced: boolean = this.state.order && (this.props.orderId === this.state.order.order_id);
    if (this.props.orderId && !orderSynced && !this.state.loading) {
      this.loadOrder();
    }
  }

  private buildDataLinks(order: any): JSX.Element[] {
    if (["inprogress", "expired"].includes(order.status)) {
      return [];
    }

    const html = order.file_urls.data.map((link: any, index: number) => {
      return ( <li key={index}><a href={link}>{link}</a></li> );
    });
    return html;
  }

  private buildTextFileLink(order: any): JSX.Element {
    const textLinks = order.file_urls.data.join("\n");
    if (textLinks.length > 0) {
      const orderId = this.props.orderId ? this.props.orderId.substring(0, 8) : "";
      const fileName = "nsidc-download_" + orderId + ".txt";
      const file = new Blob([textLinks], { type: "text/plain" });
      const fileList = (
        <li>
          <a href={URL.createObjectURL(file)} download={fileName}>{fileName}</a>
        </li>
      );
      return fileList;
    }
    return <span></span>;
  }

  private buildZipLinks(order: any): JSX.Element {
    const zipLinks = this.findZipLinks(order);
    if (!zipLinks) {
      return ( <span>Please wait...</span> );
    }

    const html = zipLinks.map((link: any, index: number) => {
      return ( <li key={index}><a href={link}>{link}</a></li> );
    });
    return html;
  }

  private findZipLinks(order: any): any {
    return order.file_urls.archive;
  }

  private completedTimestampJSX(order: any): JSX.Element | null {
    if (order.finalized_timestamp) {
      return (
        <div>
          <b>Completed:</b>&nbsp;
          {moment(order.finalized_timestamp).format(OrderDetails.timeFormat)}
        </div>
      );
    }
    return null;
  }

  private expirationTimestamp(order: any): moment.Moment | null {
    if (order.finalized_timestamp) {
      return moment(order.finalized_timestamp).clone().add(14, "days");
    }
    return null;
  }

  private loadOrder = () => {
    if (this.props.orderId) {
      this.setState({loading: true}, this.requestOrder);
    }
  }

  private requestOrder = () => {
    this.props.environment.hermesAPI.getOrder(this.props.orderId!)
      .then((order: object) => this.setState({order, loading: false}))
      .catch(() => this.setState({loading: false}));
  }

  private handleNotification = (event: any) => {
    const notification: any = JSON.parse(event);
    if (notification.order_id === this.props.orderId) {
      this.loadOrder();
    }
  }
}
