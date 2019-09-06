import * as React from "react";

import { faSortDown, faSortUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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

interface IOrderListState {
  orderSorting: OrderSorting;
}

export enum OrderSorting {
  OrderTimeUp = "start_date",
  OrderTimeDown = "-start_date",
  EndTimeUp = "end_date",
  EndTimeDown = "-end_date",
  FilenameUp = "producer_granule_id",
  FilenameDown = "-producer_granule_id",
  SizeUp = "data_size",
  SizeDown = "-data_size",
}

export class OrderList extends React.Component<IOrderListProps, IOrderListState> {
  public constructor(props: IOrderListProps) {
    super(props);

    this.state = {
      orderSorting: OrderSorting.OrderTimeDown,
    };
  }

  public shouldComponentUpdate(nextProps: IOrderListProps, nextState: IOrderListState) {
    const propsChanged = hasChanged(this.props, nextProps, ["initialLoadComplete", "orderList", "selectedOrder"]);
    const stateChanged = hasChanged(this.state, nextState, ["orderSorting"]);

    return propsChanged || stateChanged;
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
        <table id="order-table">
          <thead>
            <tr>
              {this.columnHeader("Order Time",
                OrderSorting.OrderTimeUp, OrderSorting.OrderTimeDown)}
              <th className="order-list-header">Order ID</th>
              <th className="order-list-header"># Files</th>
              <th className="order-list-header">Size (MB)</th>
              <th className="order-list-header">Status</th>
              <th className="order-list-header">Delivery</th>
              <th className="order-list-header">Deliver Time</th>
            </tr>
          </thead>
          <tbody>
            {orderList}
          </tbody>
        </table>
      </div>
    );
  }

  private updateOrderSorting = (orderSorting: OrderSorting) => {
    //    this.handleOrderParameterChange({ granuleSorting });
    this.setState({
      orderSorting,
    });
  }

  private columnHeader = (header: JSX.Element | string,
                          columnSortUp: OrderSorting, columnSortDown: OrderSorting) => {
    let newColumnSortOrder = columnSortUp;
    let classSortUp = "fa-stack-1x sort-icon";
    let classSortDown = "fa-stack-1x sort-icon";
    if (this.state.orderSorting === columnSortUp) {
      classSortUp += " sort-active";
      newColumnSortOrder = columnSortDown;
    } else if (this.state.orderSorting === columnSortDown) {
      classSortDown += " sort-active";
    }
    const iconUp = <FontAwesomeIcon icon={faSortUp} className={classSortUp} />;
    const iconDown = <FontAwesomeIcon icon={faSortDown} className={classSortDown} />;
    return <th className="order-list-header"><div className="sortColumn" onClick={(e: any) => {
      this.updateOrderSorting(newColumnSortOrder);
    }}>{header}<span className="fa-stack sort-icon-stack">{iconUp}{iconDown}</span></div></th>;
  }

}
