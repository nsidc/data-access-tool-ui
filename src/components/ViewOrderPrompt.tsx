import * as React from "react";

import { IEnvironment } from "../utils/environment";

interface IViewOrderPromptProps {
  environment: IEnvironment;
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
          <a href={this.props.environment.urls.profileUrl}>View your order</a>
        </span>
      );
    } else {
      return (<span>{"Submit an order, " + this.props.environment.user.uid + "!"}</span>);
    }
  }
}
