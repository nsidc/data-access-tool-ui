import * as moment from "moment";
import * as React from "react";

import { getOrder, openNotificationConnection } from "../utils/Hermes";

interface IOrderDetailsProps {
  orderId?: string;
}

interface IOrderDetailsState {
  order?: any;
}

export class OrderDetails extends React.Component<IOrderDetailsProps, IOrderDetailsState> {
  private static timeFormat = "YYYY-MM-DD HH:mm:ss";

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
      const links = order.links.map((link: any, index: number) => {
        return ( <li key={index}><a href={link.uri}>{link.uri}</a></li> );
      });
      return (
        <div id="order-details">
          <div>Order ID: {order.order_id}</div>
          <div>Placed: {moment.unix(order.date).format(OrderDetails.timeFormat)}</div>
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
