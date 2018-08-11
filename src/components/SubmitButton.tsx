import * as React from "react";

import { OrderSubmissionParameters } from "../types/OrderSubmissionParameters";
import { OrderTypes } from "../types/orderTypes";
import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";

interface ISubmitButtonProps {
  environment: IEnvironment;
  onSubmitOrder: any;
  orderSubmissionParameters?: OrderSubmissionParameters;
  orderType: OrderTypes;
}

interface ISubmitButtonState {
  orderSubmissionResponse?: {[index: string]: any};
}

export class SubmitButton extends React.Component<ISubmitButtonProps, ISubmitButtonState> {
  public constructor(props: ISubmitButtonProps) {
    super(props);
    this.state = {
      orderSubmissionResponse: undefined,
    };
    this.handleClick = this.handleClick.bind(this);
  }

  public shouldComponentUpdate(nextProps: ISubmitButtonProps) {
    return hasChanged(this.props, nextProps, ["orderSubmissionParameters", "orderType"]);
  }

  public render() {
    let buttonText: string;
    if (this.props.orderType === OrderTypes.listOfLinks) {
      buttonText = "Order List of Links";
    } else if (this.props.orderType === OrderTypes.zipFile) {
      buttonText = "Order Zip File";
    } else {
      throw new Error("Order type not recognized");
    }
    return (
      <button
        className="submit-button eui-btn--green"
        disabled={!this.props.orderSubmissionParameters}
        onClick={this.handleClick}>
        {buttonText}
      </button>
    );
  }

  public handleClick() {
    this.props.onSubmitOrder(this.props.orderType);
  }
}
