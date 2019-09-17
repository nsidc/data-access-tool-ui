import * as moment from "moment";
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
  OrderTimeUp,
  OrderTimeDown,
  IDUp,
  IDDown,
  FilesUp,
  FilesDown,
  SizeUp,
  SizeDown,
  StatusUp,
  StatusDown,
  DeliveryUp,
  DeliveryDown,
  DeliverTimeUp,
  DeliverTimeDown,
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

    orderList = orderList.sort((o1: any, o2: any) => {
      let sign = 1;
      // For columns other than Order Time or Order ID, if there is a tie,
      // always return the tied orders in descending Order Time.
      const order1isBeforeOrder2 = moment(o1.submitted_timestamp).isBefore(o2.submitted_timestamp);
      switch (this.state.orderSorting) {
        case OrderSorting.OrderTimeUp: sign = -1;
        case OrderSorting.OrderTimeDown:
          return order1isBeforeOrder2 ? sign : -sign;
          break;
        case OrderSorting.IDUp: sign = -1;
        case OrderSorting.IDDown:
          return (o1.order_id < o2.order_id) ? sign : -sign;
          break;
        case OrderSorting.FilesUp: sign = -1;
        case OrderSorting.FilesDown:
          if (o1.granule_count < o2.granule_count) {
            return sign;
          } else if (o1.granule_count > o2.granule_count) {
            return -sign;
          }
          return order1isBeforeOrder2 ? 1 : -1;
          break;
        case OrderSorting.StatusUp: sign = -1;
        case OrderSorting.StatusDown:
          if (o1.status < o2.status) {
            return sign;
          } else if (o1.status > o2.status) {
            return -sign;
          }
          return order1isBeforeOrder2 ? 1 : -1;
          break;
        case OrderSorting.DeliveryUp: sign = -1;
        case OrderSorting.DeliveryDown:
          if (o1.delivery < o2.delivery) {
            return sign;
          } else if (o1.delivery > o2.delivery) {
            return -sign;
          }
          return order1isBeforeOrder2 ? 1 : -1;
          break;
        default:
          break;
      }
      return 0;
    });

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

    // {this.columnHeader("Size (MB)", "order-list-right",
    //   OrderSorting.SizeUp, OrderSorting.SizeDown)}
    // {this.columnHeader("Deliver Time", "",
    //   OrderSorting.DeliverTimeUp, OrderSorting.DeliverTimeDown)}
    return (
      <div id="order-list">
        <table id="order-table">
          <thead>
            <tr>
              {this.columnHeader("Order Time", "",
                OrderSorting.OrderTimeUp, OrderSorting.OrderTimeDown)}
              {this.columnHeader("Order ID", "",
                OrderSorting.IDUp, OrderSorting.IDDown)}
              {this.columnHeader("# Files", "order-list-right",
                OrderSorting.FilesUp, OrderSorting.FilesDown)}
              {this.columnHeader("Status", "",
                OrderSorting.StatusUp, OrderSorting.StatusDown)}
              {this.columnHeader("Delivery", "",
                OrderSorting.DeliveryUp, OrderSorting.DeliveryDown)}
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
    this.setState({
      orderSorting,
    });
  }

  private columnHeader = (header: JSX.Element | string, style: string,
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
    const colStyle = "order-list-header" + (style ? " " + style : "");
    const iconUp = <FontAwesomeIcon icon={faSortUp} className={classSortUp} />;
    const iconDown = <FontAwesomeIcon icon={faSortDown} className={classSortDown} />;
    return <th className={colStyle}><div className="sortColumn" onClick={(e: any) => {
      this.updateOrderSorting(newColumnSortOrder);
    }}>{header}<span className="fa-stack sort-icon-stack">{iconUp}{iconDown}</span></div></th>;
  }

}
