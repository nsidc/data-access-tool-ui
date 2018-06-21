import * as React from "react";

import { IOrderSubmissionParameters } from "../types/OrderParameters";
import { OrderTypes } from "../types/orderTypes";
import { IEnvironment } from "../utils/environment";

interface ISubmitButtonProps {
  environment: IEnvironment;
  onSubmitOrderResponse: any;
  orderSubmissionParameters?: IOrderSubmissionParameters;
  orderType: OrderTypes;
}

interface ISubmitButtonState {
  orderSubmissionResponse?: {[index: string]: any};
}

export class SubmitButton extends React.Component<ISubmitButtonProps, ISubmitButtonState> {
  public constructor(props: ISubmitButtonProps) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.state = {
      orderSubmissionResponse: undefined,
    };
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
        className="submit-button"
        disabled={!this.props.orderSubmissionParameters}
        onClick={this.handleClick}>
        {buttonText}
      </button>
    );
  }

  public handleClick() {
    if (this.props.orderSubmissionParameters) {
      this.props.environment.hermesAPI.submitOrder(
        this.props.environment.user,
        this.props.orderSubmissionParameters.granuleURs,
        this.props.orderSubmissionParameters.collectionInfo,
        this.props.orderType,
      )
      .then((json: any) => this.handleOrderSubmissionResponse(json))
      .catch((err: any) => console.log("Order submission failed: " + err));
    }
  }

  private handleOrderSubmissionResponse(orderSubmissionResponseJSON: object) {
    this.setState({orderSubmissionResponse: orderSubmissionResponseJSON});
    this.props.onSubmitOrderResponse(this.state.orderSubmissionResponse);
  }
}
