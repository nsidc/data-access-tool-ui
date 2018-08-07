import * as React from "react";

import { IEnvironment } from "../utils/environment";
import { genericShouldUpdate } from "../utils/shouldUpdate";

interface IViewOrderPromptProps {
  environment: IEnvironment;
  orderSubmitResponse?: any;
}

export class ViewOrderPrompt extends React.Component<IViewOrderPromptProps, {}> {
  public constructor(props: IViewOrderPromptProps) {
    super(props);
  }

  public shouldComponentUpdate(nextProps: IViewOrderPromptProps) {
    return genericShouldUpdate({
      currentProps: this.props,
      nextProps,
      propsToCheck: ["environment", "orderSubmitResponse"],
    });
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
    } else if (typeof this.props.environment.user.uid === "undefined") {
      return (
        <span>Log in to place your order.</span>
      );
    } else {
      return "";
    }
  }
}
