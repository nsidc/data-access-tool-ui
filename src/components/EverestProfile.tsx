import * as React from "react";

import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";
import { OrderDetails } from "./OrderDetails";
import { OrderList } from "./OrderList";

interface IEverestProps {
  environment: IEnvironment;
}

interface IEverestProfileState {
  selectedOrder?: string;
}

export class EverestProfile extends React.Component<IEverestProps, IEverestProfileState> {
  public constructor(props: any) {
    super(props);

    this.state = {
      selectedOrder: undefined,
    };
  }

  public shouldComponentUpdate(nextProps: IEverestProps, nextState: IEverestProfileState) {
    const propsChanged = hasChanged(this.props, nextProps, ["environment"]);
    const stateChanged = hasChanged(this.state, nextState, ["selectedOrder"]);

    return propsChanged || stateChanged;
  }

  public render() {
    return (
      <div id="profile-container">
        <OrderList
          environment={this.props.environment}
          onSelectionChange={this.handleOrderSelection}
          selectedOrder={this.state.selectedOrder} />
        <OrderDetails
          environment={this.props.environment}
          orderId={this.state.selectedOrder} />
      </div>
    );
  }

  private handleOrderSelection = (orderId: string) => {
    this.setState({
      selectedOrder: orderId,
    });
  }
}
