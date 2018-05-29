import * as React from "react";
import * as ReactModal from "react-modal";

import { ViewOrder } from "./ViewOrder";

ReactModal.setAppElement("#everest-ui");

interface IViewOrderButtonProps {
  onViewOrderResponse: any;
  orderDetails: any;
  orderSubmitResponse?: any;
}

interface IViewOrderButtonState {
  orderDetailsDisplayed: boolean;
}

export class ViewOrderButton extends React.Component<IViewOrderButtonProps, IViewOrderButtonState> {
  public constructor(props: any) {
    super(props);
    this.handleOpenOrderDetailModal = this.handleOpenOrderDetailModal.bind(this);
    this.handleCloseOrderDetailModal = this.handleCloseOrderDetailModal.bind(this);

    this.state = {
      orderDetailsDisplayed: false,
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
          <ReactModal
            isOpen={this.state.orderDetailsDisplayed}
            onRequestClose={this.handleCloseOrderDetailModal}>
            <button onClick={this.handleCloseOrderDetailModal}>x</button>
            <button>Refresh</button>
            <ViewOrder
              orderId={orderState.order_id}
              destination={orderState.destination}
              status={orderState.status} />
          </ReactModal>
        </span>
      );

    } else {
      orderViewButton = <span>{"Submit an order, buddy!"}</span>;
    }
    return orderViewButton;
  }

  private handleOpenOrderDetailModal() {
    this.setState({orderDetailsDisplayed: true});
  }

  private handleCloseOrderDetailModal() {
    this.setState({orderDetailsDisplayed: false});
  }
}
