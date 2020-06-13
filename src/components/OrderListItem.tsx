import * as moment from "moment";
import * as React from "react";

import { faBan, faCheck, faClock, faEllipsisH,
  faExclamationTriangle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
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
    let status = this.props.order.status;
    const orderCompletedDate = moment(this.props.order.finalized_timestamp);

    // Make mock "expired" status based on completion date +2 weeks
    if (orderCompletedDate.isValid()) {
      const orderExpirationDate = orderCompletedDate.clone().add(14, "days");
      if (moment(orderExpirationDate).isBefore(moment.now())) {
        style += " order-list-item-expired";
        if (status === "complete" || status === "error" || status === "warning") {
          status = "expired";
        }
      }
    }

    const delivery = (this.props.order.delivery === "ESI") ?
      "Zip" : this.props.order.delivery;
    const submitted = moment(this.props.order.submitted_timestamp).format(OrderListItem.timeFormat);
    const statusIcon = getOrderStatus(status);
    return (
      <tr onClick={this.handleOrderSelection} className={style}>
        <td>{submitted}</td>
        <td>{this.props.order.order_id}</td>
        <td className="order-list-right">{this.props.order.granule_count}</td>
        <td>{statusIcon}</td>
        <td>{delivery}</td>
      </tr>
    );
  }

  private handleOrderSelection = () => {
    this.props.onOrderSelection(this.props.order.order_id);
  }
}

export function getOrderStatus(orderStatus: string): any {
  let status = null;
  switch (orderStatus) {
    case "cancelrequested":
    case "cancelled":
      status = <FontAwesomeIcon icon={faBan} className="order-error" />;
      break;
    case "complete":
      status = <FontAwesomeIcon icon={faCheck} className="order-success" />;
      break;
    case "error":
      status = <FontAwesomeIcon icon={faExclamationTriangle} className="order-error" />;
      break;
    case "expired":
      status = <FontAwesomeIcon icon={faClock} />;
      break;
    case "failed":
      status = <FontAwesomeIcon icon={faTimesCircle} className="order-error" />;
      break;
    case "inprogress":
    case "pending":
      status = <FontAwesomeIcon icon={faEllipsisH} className="order-success" />;
      break;
    case "warning":
      status = <FontAwesomeIcon icon={faExclamationTriangle} className="order-warning" />;
      break;
    default:
      break;
  }
  return <span>{status} {orderStatus}</span>;
}
