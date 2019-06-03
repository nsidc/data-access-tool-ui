import * as React from "react";

import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { OrderListItem } from "./OrderListItem";

interface IOrderListProps {
  environment: IEnvironment;
  initialLoadComplete: boolean;
  onSelectionChange: any;
  orderList: object[];
  selectedOrder?: string;
}

export class OrderList extends React.Component<IOrderListProps> {
  public constructor(props: IOrderListProps) {
    super(props);
  }

  public shouldComponentUpdate(nextProps: IOrderListProps) {
    const propsChanged = hasChanged(this.props, nextProps, ["initialLoadComplete", "orderList", "selectedOrder"]);

    return propsChanged;
  }

  public render() {
    let orderList: any[] = this.props.orderList;

    if (!this.props.initialLoadComplete) { return null; }

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

    return (
      <div id="order-list">
        {orderList}
      </div>
    );
  }

}
