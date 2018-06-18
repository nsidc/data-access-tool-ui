import * as moment from "moment";
import * as React from "react";

import { HERMES_BASE_URL } from "../utils/environment";
import { getOrder, openNotificationConnection } from "../utils/Hermes";

interface IOrderDetailsProps {
  orderId?: string;
}

interface IOrderDetailsState {
  order?: any;
}

export class OrderDetails extends React.Component<IOrderDetailsProps, IOrderDetailsState> {
  private static timeFormat = "l LT";

  public constructor(props: any) {
    super(props);
    this.handleNotification = this.handleNotification.bind(this);
    this.refreshOrder = this.refreshOrder.bind(this);
    this.state = {
      order: undefined,
    };
  }

  public render() {
    if (this.state.order) {
      const order: any = this.state.order;
      const links = this.getOrderLinks(order);
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
    openNotificationConnection(this.handleNotification);
  }

  public componentDidUpdate() {
    const orderSynced: boolean = this.state.order && (this.props.orderId === this.state.order.order_id);
    if (this.props.orderId && !orderSynced) {
      this.refreshOrder();
    }
  }

  private getOrderLinks(order: any) {
    if (["inprogress", "expired"].includes(order.status)) {
      return [];
    }

    const zipLink: any = order.links.find((link: any) => link.uri.includes(order.order_id));
    if (zipLink) {
      if (!zipLink.uri.includes("https://")) {
        zipLink.uri = "https://" + HERMES_BASE_URL + zipLink.uri;
      }
      return ( <li><a href={zipLink.uri}>{zipLink.uri}</a></li> );
    } else {
      const links = order.links.map((link: any, index: number) => {
        return ( <li key={index}><a href={link.uri}>{link.uri}</a></li> );
      });
      return links;
    }
  }

  private refreshOrder() {
    if (this.props.orderId) {
      getOrder(this.props.orderId)
        .then((order: object) => this.setState({order}));
    }
  }

  private handleNotification(event: any) {
    const notification: any = JSON.parse(event);
    if (notification.order_id === this.props.orderId) {
      this.refreshOrder();
    }
  }
}
