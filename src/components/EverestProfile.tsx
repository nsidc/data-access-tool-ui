import * as React from "react";

import { OrderDetails } from "./OrderDetails";
import { OrderList } from "./OrderList";

interface IEverestProfileState {
  selectedOrder?: string;
}

export class EverestProfile extends React.Component<{}, IEverestProfileState> {
  public constructor(props: any) {
    super(props);
    this.handleOrderSelection = this.handleOrderSelection.bind(this);
    this.state = {
      selectedOrder: undefined,
    };
  }

  public render() {
    return (
      <div style={{display: "flex"}}>
        <OrderList
          onSelectionChange={this.handleOrderSelection}
          selectedOrder={this.state.selectedOrder} />
        <OrderDetails
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
