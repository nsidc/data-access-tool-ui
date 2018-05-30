import * as React from "react";
import * as ReactModal from "react-modal";

ReactModal.setAppElement("#everest-ui");

interface IViewOrderProps {
  orderId: string;
  destination: string;
  status: string;
  orderDetails: any;
  orderModalDisplayed: boolean;
  orderSubmitResponse: any;
  onCloseOrderDetailModal: any;
  onRequestOrder: any;
}

export class ViewOrder extends React.Component<IViewOrderProps, {}> {
  public constructor(props: any) {
    super(props);
    this.handleRefreshOrder = this.handleRefreshOrder.bind(this);
  }

  public render() {
    let orderLinks: any = "loading...";
    let granuleCount: any = "loading...";
    if (this.props.orderDetails) {
      orderLinks = this.props.orderDetails.links.map(
        (link: {status: string, uri: string}, index: number) =>
          <div key={index}><a href={link.uri}>{link.uri}</a></div>,
      );
      granuleCount = this.props.orderDetails.granule_URs.length;
    }
    return (
      <ReactModal
        isOpen={this.props.orderModalDisplayed}
        onRequestClose={this.props.onCloseOrderDetailModal}>
        <button onClick={this.props.onCloseOrderDetailModal}>x</button>
        <button onClick={this.handleRefreshOrder}>Refresh</button>
        <h2>Order ID: {this.props.orderId}</h2>
        <h3>Destination: {this.props.destination}</h3>
        <h3>Status: {this.props.status}</h3>
        <h3>Count: {granuleCount} granules</h3>
        <div>
          {orderLinks}
        </div>
      </ReactModal>
    );
  }

  private handleRefreshOrder() {
    this.props.onRequestOrder(this.props.orderId);
  }
}
