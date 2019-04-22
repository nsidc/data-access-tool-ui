import * as moment from "moment";
import * as React from "react";

import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { OrderListItem } from "./OrderListItem";

interface IOrderListProps {
  environment: IEnvironment;
  initialLoadComplete: boolean;
  onSelectionChange: any;
  selectedOrder?: string;
  updateOrderCount: (count: number) => void;
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
    const propsChanged = hasChanged(this.props, nextProps, ["initialLoadComplete", "selectedOrder"]);
    const stateChanged = hasChanged(this.state, nextState, ["orderList"]);

    return propsChanged || stateChanged;
  }

  public render() {
    let orderList: any[] = this.state.orderList;

    if (!this.props.initialLoadComplete || (orderList.length === 0)) { return null; }

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

  public componentDidMount() {
    this.props.environment.hermesAPI.getUserOrders(this.props.environment.user)
        .then((orders: any) => Object.values(orders).sort((a: any, b: any) => {
          return moment(b.submitted_timestamp).diff(moment(a.submitted_timestamp));
        }))
      .then((orderList: any) => {
        this.setState({orderList}, () => this.props.updateOrderCount(orderList.length));
      });
  }
}
