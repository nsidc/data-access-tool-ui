import * as moment from "moment";
import * as React from "react";

import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { LoadingIcon } from "./LoadingIcon";

interface IOrderDetailsProps {
  environment: IEnvironment;
  initialLoadComplete?: boolean;
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
    const propsChanged = hasChanged(this.props, nextProps, ["initialLoadComplete", "orderId"]);
    return stateChanged || propsChanged;
  }

  public render() {
    const loading = !this.props.initialLoadComplete || this.state.loading;
    const noOrderSelected = !this.state.order;

    if (loading) {
      return (
        <div id="order-details"><LoadingIcon size="5x" /></div>
      );
    } else if (noOrderSelected) {
      const orderList = (<tr><td colSpan={4}><LoadingIcon size="5x" /></td></tr>);
      return (
        <table id="granule-table">
          <thead>
            <tr>
              <th>Order Time</th>
              <th>Order ID</th>
              <th>Size (MB)</th>
            </tr>
          </thead>
          <tbody>
            {orderList}
          </tbody>
        </table>
      );
    } else {
      const order: any = this.state.order;
      const dataLinks = this.buildDataLinks(order);
      const zipLinks = this.buildZipLinks(order);
      const orderPlacedDate = moment(order.submitted_timestamp);
      const orderExpirationDate = orderPlacedDate.clone().add(5, "days");
      return (
        <div id="order-details">
          <div>Order ID: {order.order_id}</div>
          <div>Placed: {orderPlacedDate.format(OrderDetails.timeFormat)}</div>
          <div>Expires: {orderExpirationDate.format(OrderDetails.timeFormat)}</div>
          <div>Status: {order.status}</div>
          <div>Fulfillment method: {order.fulfillment}</div>
          <div>Delivery method: {order.delivery}</div>
          <hr />
          <div>Zip links (Note: download may take a moment to start):
            <ul>{zipLinks}</ul>
          </div>

          <div>File links:
            <ul>{dataLinks}</ul>
          </div>
        </div>
      );
    }
  }

  public componentDidMount() {
    this.props.environment.hermesAPI.openNotificationConnection(this.props.environment.user,
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
