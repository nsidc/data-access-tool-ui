import * as React from "react";

import { IEnvironment } from "../utils/environment";
import { genericShouldUpdate } from "../utils/shouldUpdate";
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
    return genericShouldUpdate({
      currentProps: this.props,
      currentState: this.state,
      nextProps,
      nextState,
      propsToCheck: ["environment"],
      stateToCheck: ["selectedOrder"],
    });
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
