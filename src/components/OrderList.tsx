import * as React from "react";

import { getUserOrders } from "../Hermes";
import { OrderListItem } from "./OrderListItem";

interface IOrderListProps {
  onSelectionChange: any;
  selectedOrder?: string;
}

interface IOrderListState {
  orderList: object[];
}

export class OrderList extends React.Component<IOrderListProps, IOrderListState> {
  public constructor(props: IOrderListProps) {
    super(props);
    this.state = {
      orderList: [],
    };
  }

  public render() {
    let orderList: any[] = this.state.orderList;
    if (this.state.orderList.length > 0) {
      orderList = orderList.sort((a, b) => b.date - a.date);
      orderList = orderList.map((order: any, index: number) => {
        let selected: boolean = false;
        if (order.order_id === this.props.selectedOrder) {
          selected = true;
        }
        return (
          <OrderListItem
            key={index}
            selected={selected}
            onOrderSelection={this.props.onSelectionChange}
            order={order} />
        );
      });
    }
    return (
      <div id="order-list">
        {orderList}
      </div>
    );
  }

  public componentDidMount() {
    getUserOrders()
      .then((orders) => Object.values(orders))
      .then((orderList) => this.setState({orderList}));
  }
}
