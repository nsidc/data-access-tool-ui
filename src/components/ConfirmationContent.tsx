/* tslint:disable:max-classes-per-file */
import * as React from "react";

import { hasChanged } from "../utils/hasChanged";

interface IOrderConfirmationContentProps {
  onCancel: any;
  onOK: any;
}

export class OrderConfirmationContent extends React.Component<IOrderConfirmationContentProps, {}> {
  public constructor(props: IOrderConfirmationContentProps) {
    super(props);
  }

  public shouldComponentUpdate(nextProps: IOrderConfirmationContentProps) {
    return false;
  }

  public render() {
    const msg = "Your download order is about to be submitted. " +
      "You will be able to view the status of your order on the Orders page.";
    return (
      <div>
        <h3>Confirm Your Download Order</h3>
        <p>{msg}</p>
        <button className="submit-button eui-btn--green"
                onClick={this.props.onOK}>
          OK
        </button>
        <button className="cancel-button eui-btn--red"
                onClick={this.props.onCancel}>
          Cancel
        </button>
      </div>
    );
  }
}

interface IOrderErrorContentProps {
  error: any;
  onOK: any;
}

export class OrderErrorContent extends React.Component<IOrderErrorContentProps, {}> {
  public constructor(props: IOrderErrorContentProps) {
    super(props);
  }

  public shouldComponentUpdate(nextProps: IOrderErrorContentProps) {
    return hasChanged(this.props, nextProps, ["error"]);
  }

  public render() {
    const msg = "There was an issue submitting your order. " +
      "Please contact User Services at nsidc@nsidc.org for further information and assistance.";
    return (
      <div>
        <h3>Something went wrong!</h3>
        <p>{msg}</p>
        <button className="submit-button eui-btn--red"
                onClick={this.props.onOK}>
          OK
        </button>
      </div>
    );
  }
}

interface IOrderSuccessContentProps {
  onOK: any;
  response: any;
}

export class OrderSuccessContent extends React.Component<IOrderSuccessContentProps, {}> {
  public constructor(props: IOrderSuccessContentProps) {
    super(props);
  }

  public shouldComponentUpdate(nextProps: IOrderSuccessContentProps) {
    return hasChanged(this.props, nextProps, ["response"]);
  }

  public render() {
    const orderId = this.props.response.message.order_id;
    const msg = "Your download order has been submitted. " +
      `You may view the status of your order (${orderId}) on the Orders page.`;
    return (
      <div>
        <h3>Order Received</h3>
        <p>{msg}</p>
        <button className="submit-button eui-btn--green"
                onClick={this.props.onOK}>
          OK
        </button>
      </div>
    );
  }
}
