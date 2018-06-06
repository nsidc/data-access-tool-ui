import * as moment from "moment";
import * as React from "react";

import { getUserOrders } from "../Hermes";

interface IOrderListState {
  orderList?: object[];
}

export class OrderList extends React.Component<{}, IOrderListState> {
  private static timeFormat = "YYYY-MM-DD HH:mm:ss";

  public constructor(props: {}) {
    super(props);
    this.state = {
      orderList: [],
    };
  }

  public render() {
    let orderList: object[];
    if (this.state.orderList) {
      orderList = this.state.orderList.map((order: any, index: number) => {
        return (
          <div key={index}>
            {moment(order.date).format(OrderList.timeFormat)} - {order.status}
          </div>
        );
      });
    } else {
      orderList = [];
    }
    return (
      <div>
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
