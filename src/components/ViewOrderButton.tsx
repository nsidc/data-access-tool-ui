import * as React from "react";

import { viewOrder} from "../Hermes";
import { ViewOrder } from "./ViewOrder";

interface IViewOrderButtonProps {
  onViewOrderResponse: any;
  orderViewResponse?: any;
  orderSubmitResponse?: any;
}

interface IViewOrderButtonState {
  orderModalDisplayed: boolean;
}

export class ViewOrderButton extends React.Component<IViewOrderButtonProps, IViewOrderButtonState> {
  public constructor(props: any) {
    super(props);
    this.handleOpenOrderDetailModal = this.handleOpenOrderDetailModal.bind(this);
    this.handleCloseOrderDetailModal = this.handleCloseOrderDetailModal.bind(this);
    this.requestOrder = this.requestOrder.bind(this);

    this.state = {
      orderModalDisplayed: false,
    };
  }

  public render() {
    let orderViewButton: any;
    if (this.props.orderSubmitResponse) {
      const orderState = this.props.orderSubmitResponse.message;
      orderViewButton = (
        <span>
          <button
            className="view-order-button"
            onClick={this.handleOpenOrderDetailModal}>
            View Details ({orderState.order_id})
          </button>
          <ViewOrder
            orderId={orderState.order_id}
            destination={orderState.destination}
            status={orderState.status}
            orderDetails={this.props.orderViewResponse}
            orderSubmitResponse={this.props.orderSubmitResponse}
            onRequestOrder={this.requestOrder}
            onCloseOrderDetailModal={this.handleCloseOrderDetailModal}
            orderModalDisplayed={this.state.orderModalDisplayed} />
        </span>
      );

    } else {
      orderViewButton = <span>{"Submit an order, buddy!"}</span>;
    }
    return orderViewButton;
  }

  public componentDidUpdate(prevProps: IViewOrderButtonProps) {
    if (this.props.orderSubmitResponse
        && this.props.orderSubmitResponse !== prevProps.orderSubmitResponse) {
      this.requestOrder();
    }
  }

  private requestOrder() {
    const orderId = this.props.orderSubmitResponse.message.order_id;
    viewOrder(this.props.orderSubmitResponse.message.order_id)
      .then((orderResponse: any) => this.props.onViewOrderResponse(orderResponse))
      .then(() => { console.log("Order data received for " + orderId); });
  }

  private handleOpenOrderDetailModal() {
    this.setState({orderModalDisplayed: true});
  }

  private handleCloseOrderDetailModal() {
    this.setState({orderModalDisplayed: false});
  }
}
