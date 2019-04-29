import * as moment from "moment";
import * as React from "react";

import { hasChanged } from "../utils/hasChanged";

interface IOrderListItemProps {
  order: any;
  onOrderSelection: (orderId: string) => void;
  selected: boolean;
}

export class OrderListItem extends React.Component<IOrderListItemProps, {}> {
  private static timeFormat = "l LT";

  public shouldComponentUpdate(nextProps: IOrderListItemProps) {
    return hasChanged(this.props, nextProps, ["order", "selected"]);
  }

  public render() {
    let style: string = "order-list-item";
    if (this.props.selected) {
      style += " order-list-item-selected";
    }
    return (
      <div onClick={this.handleOrderSelection} className={style}>
        {moment(this.props.order.submitted_timestamp).format(OrderListItem.timeFormat)}
      </div>
    );
  }

  private handleOrderSelection = () => {
    this.props.onOrderSelection(this.props.order.order_id);
  }
}
