import * as moment from "moment";
import * as React from "react";

import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
    const delivery = (this.props.order.delivery === "ESI") ?
      "Zip" : this.props.order.delivery;
    const submitted = moment(this.props.order.submitted_timestamp).format(OrderListItem.timeFormat);
    let status = null;
    switch (this.props.order.status) {
      case "pending":
        status = <FontAwesomeIcon icon={faEllipsisH} className="order-warning" />;
        break;
      case "complete":
        status = <FontAwesomeIcon icon={faCheck} className="order-success" />;
      default:
        break;
    }
    return (
      <tr onClick={this.handleOrderSelection} className={style}>
        <td>{submitted}</td>
        <td>{this.props.order.order_id}</td>
        <td>{this.props.order.granule_count}</td>
        <td>----</td>
        <td>{status} {this.props.order.status}</td>
        <td>{delivery}</td>
        <td>----</td>
      </tr>
    );
  }

  private handleOrderSelection = () => {
    this.props.onOrderSelection(this.props.order.order_id);
  }
}
