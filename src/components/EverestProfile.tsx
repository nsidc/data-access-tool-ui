import * as React from "react";

import { IEnvironment } from "../utils/environment";
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
    this.handleOrderSelection = this.handleOrderSelection.bind(this);
    this.state = {
      selectedOrder: undefined,
    };
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

  private handleOrderSelection(orderId: string) {
    this.setState({
      selectedOrder: orderId,
    });
  }
}
