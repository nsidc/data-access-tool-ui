import * as React from "react";

import { OrderDetails } from "./OrderDetails";
import { OrderList } from "./OrderList";

export class EverestProfile extends React.Component<{}, {}> {
  public constructor(props: any) {
    super(props);
    this.state = {
    };
  }

  public render() {
    return (
      <div style={{display: "flex"}}>
        <OrderList />
        <OrderDetails />
      </div>
    );
  }
}
