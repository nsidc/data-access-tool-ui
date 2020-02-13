import * as moment from "moment";
import * as React from "react";

import { EverestUser, EverestUserUnknownStatus, isLoggedInUser } from "../types/User";
import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { updateUser, UserContext } from "../utils/state";
import { EDLButton } from "./EDLButton";
import { OrderDetails } from "./OrderDetails";
import { OrderList } from "./OrderList";

interface IEverestProps {
  environment: IEnvironment;
}

interface IEverestProfileState {
  initialLoadComplete: boolean;
  orderList: object[];
  selectedOrder?: string;
  user: EverestUser;
}

export class EverestProfile extends React.Component<IEverestProps, IEverestProfileState> {
  public constructor(props: any) {
    super(props);

    this.state = {
      initialLoadComplete: false,
      orderList: [],
      selectedOrder: undefined,
      user: EverestUserUnknownStatus,
    };
  }

  public shouldComponentUpdate(nextProps: IEverestProps, nextState: IEverestProfileState) {
    const propsChanged = hasChanged(this.props, nextProps, ["environment"]);
    const stateChanged = hasChanged(this.state, nextState, ["initialLoadComplete",
                                                            "orderList",
                                                            "selectedOrder",
                                                            "user"]);

    return propsChanged || stateChanged;
  }

  public componentDidMount() {
    updateUser(this);
  }

  public componentDidUpdate(prevProps: IEverestProps, prevState: IEverestProfileState) {
    if (isLoggedInUser(this.state.user) && !isLoggedInUser(prevState.user)) {
      this.props.environment.hermesAPI.openNotificationConnection(this.state.user, this.handleNotification);
      this.updateOrderList();
    }
  }

  public render() {
    const userHasNoOrders = this.state.orderList.length === 0;

    let ordersView;

    if (!isLoggedInUser(this.state.user)) {
      ordersView = (
        <div id="order-details">{"You must be logged in to view your orders."}</div>
      );
    } else if (userHasNoOrders) {
      ordersView =  (
        <div id="order-details">{"You have no orders."}</div>
      );
    } else {
      ordersView = (
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

    return (
      <UserContext.Provider value={{user: this.state.user, updateUser: () => updateUser(this)}} >
        <EDLButton environment={this.props.environment} />
        {ordersView}
      </UserContext.Provider>
    );
  }

  private handleNotification = (event: any) => {
    this.updateOrderList();
  }

  private updateOrderList = () => {
    if (this.state.user) {
      this.props.environment.hermesAPI.getUserOrders(this.state.user)
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
