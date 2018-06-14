import * as React from "react";

import { PROFILE_URL, user } from "../environment";

interface IViewOrderPromptProps {
  orderSubmitResponse?: any;
}

export class ViewOrderPrompt extends React.Component<IViewOrderPromptProps, {}> {
  public constructor(props: IViewOrderPromptProps) {
    super(props);
  }

  public render() {
    if (this.props.orderSubmitResponse) {
      const orderState = this.props.orderSubmitResponse.message;
      return (
        <span>
          {"Order " + orderState.order_id + " submitted. "}
          <a href={PROFILE_URL}>View your order</a>
        </span>
      );
    } else {
      return (<span>{"Submit an order, " + user.uid + "!"}</span>);
    }
  }
}
