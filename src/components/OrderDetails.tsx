import * as moment from "moment";
import * as React from "react";

import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { LoadingIcon } from "./LoadingIcon";

interface IOrderDetailsProps {
  environment: IEnvironment;
  orderId?: string;
}

interface IOrderDetailsState {
  loading: boolean;
  order?: any;
}

export class OrderDetails extends React.Component<IOrderDetailsProps, IOrderDetailsState> {
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
    const propsChanged = hasChanged(this.props, nextProps, ["orderId"]);
    return stateChanged || propsChanged;
  }

  public render() {
    if (this.state.loading) {
      return (
        <LoadingIcon />
      );
    } else if (this.state.order) {
      const order: any = this.state.order;
      const links = this.buildOrderLinks(order);
      const orderPlacedDate = moment.unix(order.date);
      const orderExpirationDate = orderPlacedDate.clone().add(5, "days");
      return (
        <div id="order-details">
          <div>Order ID: {order.order_id}</div>
          <div>Placed: {orderPlacedDate.format(OrderDetails.timeFormat)}</div>
          <div>Expires: {orderExpirationDate.format(OrderDetails.timeFormat)}</div>
          <div>Status: {order.status}</div>
          <div>Destination: {order.destination}</div>
          <div>Links:
            <ul>{links}</ul>
          </div>
        </div>
      );
    } else {
      return (
        <div id="order-details">{"Select an order!"}</div>
      );
    }
  }

  public componentDidMount() {
    this.props.environment.hermesAPI.openNotificationConnection(this.props.environment.user,
                                                                this.handleNotification);
  }

  public componentDidUpdate() {
    const orderSynced: boolean = this.state.order && (this.props.orderId === this.state.order.order_id);
    if (this.props.orderId && !orderSynced) {
      this.loadOrder();
    }
  }

  private buildOrderLinks(order: any): JSX.Element[] {
    if (["inprogress", "expired"].includes(order.status)) {
      return [];
    }

    const zipLink: any = order.links.find((link: any) => link.uri.includes(order.order_id));
    if (zipLink) {
      if (!zipLink.uri.includes("https://")) {
        zipLink.uri = "https://" + this.props.environment.urls.hermesBaseUrl + zipLink.uri;
      }
      return [( <li><a href={zipLink.uri}>{zipLink.uri}</a></li> )];
    } else {
      const links = order.links.map((link: any, index: number) => {
        return ( <li key={index}><a href={link.uri}>{link.uri}</a></li> );
      });
      return links;
    }
  }

  private loadOrder = () => {
    if (this.props.orderId) {
      this.setState({loading: true}, this.requestOrder);
    }
  }

  private requestOrder = () => {
    this.props.environment.hermesAPI.getOrder(this.props.orderId!)
      .then((order: object) => this.setState({order}))
      .finally(() => this.setState({loading: false}));
  }

  private handleNotification = (event: any) => {
    const notification: any = JSON.parse(event);
    if (notification.order_id === this.props.orderId) {
      this.loadOrder();
    }
  }
}
