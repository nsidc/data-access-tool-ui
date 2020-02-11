import * as moment from "moment";
import * as React from "react";

import { isLoggedInUser } from "../types/User";
import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { OrderDetails } from "./OrderDetails";
import { OrderList } from "./OrderList";

interface IEverestProps {
  environment: IEnvironment;
}

interface IEverestProfileState {
  initialLoadComplete: boolean;
  orderList: object[];
  selectedOrder?: string;
}

export class EverestProfile extends React.Component<IEverestProps, IEverestProfileState> {
  public constructor(props: any) {
    super(props);

    this.state = {
      initialLoadComplete: false,
      orderList: [],
      selectedOrder: undefined,
    };
  }

  public shouldComponentUpdate(nextProps: IEverestProps, nextState: IEverestProfileState) {
    const propsChanged = hasChanged(this.props, nextProps, ["environment"]);
    const stateChanged = hasChanged(this.state, nextState, ["initialLoadComplete", "orderList", "selectedOrder"]);

    return propsChanged || stateChanged;
  }

  public componentDidMount() {
    this.props.environment.hermesAPI.openNotificationConnection(this.props.environment.user,
      this.handleNotification);
    this.updateOrderList();
  }

  public render() {
    const userHasNoOrders = this.state.orderList.length === 0;

    if (!isLoggedInUser(this.props.environment.user)) {
      return (
        <div>
          <div id="order-details">{"You must be logged in to view your orders."}</div>
        </div>
      );
    } else if (userHasNoOrders) {
      return (
        <div>
          <div id="order-details">{"You have no orders."}</div>
        </div>
      );
    } else {
      return (
        <div>
          <OrderList
            environment={this.props.environment}
            initialLoadComplete={this.state.initialLoadComplete}
            onSelectionChange={this.handleOrderSelection}
            orderList={this.state.orderList}
            selectedOrder={this.state.selectedOrder} />
          <OrderDetails
            environment={this.props.environment}
            initialLoadComplete={this.state.initialLoadComplete}
            orderId={this.state.selectedOrder} />
        </div>
      );
    }
  }

  private handleNotification = (event: any) => {
    this.updateOrderList();
  }

  private updateOrderList = () => {
    if (this.props.environment.user) {
      this.props.environment.hermesAPI.getUserOrders(this.props.environment.user)
        .then((orders: any) => Object.values(orders).sort((a: any, b: any) => {
          return moment(b.submitted_timestamp).diff(moment(a.submitted_timestamp));
        }))
        .then((orderList: any) => {
          this.setState({ orderList, initialLoadComplete: true });
        });
    }
  }

  private handleOrderSelection = (orderId: string) => {
    this.setState({
      selectedOrder: orderId,
    });
  }
}
