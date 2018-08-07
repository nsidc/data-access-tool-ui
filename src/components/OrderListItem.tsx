import * as moment from "moment";
import * as React from "react";

import { genericShouldUpdate } from "../utils/shouldUpdate";

interface IOrderListItemProps {
  order: any;
  onOrderSelection: (orderId: string) => void;
  selected: boolean;
}

export class OrderListItem extends React.Component<IOrderListItemProps, {}> {
  private static timeFormat = "l LT";

  public shouldComponentUpdate(nextProps: IOrderListItemProps) {
    return genericShouldUpdate({
      currentProps: this.props,
      nextProps,
      propsToCheck: ["order", "selected"],
    });
  }

  public render() {
    let style: string = "order-list-item";
    if (this.props.selected) {
      style += " order-list-item-selected";
    }
    return (
      <div onClick={this.handleOrderSelection} className={style}>
        {moment.unix(this.props.order.date).format(OrderListItem.timeFormat)}
      </div>
    );
  }

  private handleOrderSelection = () => {
    this.props.onOrderSelection(this.props.order.order_id);
  }
}
