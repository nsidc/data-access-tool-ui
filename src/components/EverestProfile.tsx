import * as React from "react";

import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { OrderDetails } from "./OrderDetails";
import { OrderList } from "./OrderList";

interface IEverestProps {
  environment: IEnvironment;
}

interface IEverestProfileState {
  initialLoadComplete: boolean;
  orderCount: number;
  selectedOrder?: string;
}

export class EverestProfile extends React.Component<IEverestProps, IEverestProfileState> {
  public constructor(props: any) {
    super(props);

    this.state = {
      initialLoadComplete: false,
      orderCount: 0,
      selectedOrder: undefined,
    };
  }

  public shouldComponentUpdate(nextProps: IEverestProps, nextState: IEverestProfileState) {
    const propsChanged = hasChanged(this.props, nextProps, ["environment"]);
    const stateChanged = hasChanged(this.state, nextState, ["orderCount", "selectedOrder"]);

    return propsChanged || stateChanged;
  }

  public render() {
    return (
      <div id="profile-container">
        <OrderList
          environment={this.props.environment}
          initialLoadComplete={this.state.initialLoadComplete}
          onSelectionChange={this.handleOrderSelection}
          selectedOrder={this.state.selectedOrder}
          updateOrderCount={this.updateOrderCount} />
        <OrderDetails
          environment={this.props.environment}
          initialLoadComplete={this.state.initialLoadComplete}
          orderCount={this.state.orderCount}
          orderId={this.state.selectedOrder} />
      </div>
    );
  }

  private handleOrderSelection = (orderId: string) => {
    this.setState({
      selectedOrder: orderId,
    });
  }

  private updateOrderCount = (count: number) => {
    this.setState({
      initialLoadComplete: true,
      orderCount: count,
    });
  }
}
