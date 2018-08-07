import * as React from "react";

import { IEnvironment } from "../utils/environment";
import { genericShouldUpdate } from "../utils/shouldUpdate";
import { OrderListItem } from "./OrderListItem";

interface IOrderListProps {
  environment: IEnvironment;
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

  public shouldComponentUpdate(nextProps: IOrderListProps, nextState: IOrderListState) {
    return genericShouldUpdate({
      currentProps: this.props,
      currentState: this.state,
      nextProps,
      nextState,
      propsToCheck: ["selectedOrder"],
      stateToCheck: ["orderList"],
    });
  }

  public render() {
    let orderList: any[] = this.state.orderList;
    if (this.state.orderList.length > 0) {
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
    this.props.environment.hermesAPI.getUserOrders(this.props.environment.user)
      .then((orders: any) => Object.values(orders).sort((a, b) => b.date - a.date))
      .then((orderList: any) => this.setState({orderList}));
  }
}
