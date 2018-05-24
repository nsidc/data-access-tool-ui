import * as React from "react";

import { viewOrder} from "../Hermes";

interface IViewOrderProps {
  orderId: string;
  destination: string;
  status: string;
}

interface IViewOrderState {
  orderDetails?: any;
}

export class ViewOrder extends React.Component<IViewOrderProps, IViewOrderState> {
  public constructor(props: any) {
    super(props);
    this.state = {
      orderDetails: undefined,
    }
  }

  public componentDidMount() {
    viewOrder(this.props.orderId).then(order => this.setState({
      orderDetails: order,
    }));
  }

  public render() {
    let orderLinks: any = "loading...";
    let granuleCount: any = "loading...";
    if (this.state.orderDetails) {
      orderLinks = this.state.orderDetails["links"].map(
        (link: {status: string, uri: string}, index: number) => (
          <div><a key={index} href={link.uri}>{link.uri}</a></div>
        )
      );
      granuleCount = this.state.orderDetails["granule_URs"].length;
    }
    return (
      <div>
        <h2>Order ID: {this.props.orderId}</h2>
        <h3>Destination: {this.props.destination}</h3>
        <h3>Status: {this.props.status}</h3>
        <h3>Count: {granuleCount} granules</h3>
        <div>
          {orderLinks}
        </div>
      </div>
    );
  }
}
