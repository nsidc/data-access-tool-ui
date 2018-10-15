import * as React from "react";

import { CMR_MAX_GRANULES } from "../utils/CMR";
import { IEnvironment } from "../utils/environment";

interface IOrderConfirmationContentProps {
  cmrGranuleCount?: number;
  environment: IEnvironment;
  onCancel: () => void;
  onOK: () => void;
}

export const OrderConfirmationContent = (props: IOrderConfirmationContentProps) => {
  let warningMessage = null;
  if (props.cmrGranuleCount && (props.cmrGranuleCount > CMR_MAX_GRANULES)) {
    warningMessage = (
      <div className="order-limit-message">
        IMPORTANT: During the beta test period, orders are limited to 10,000
        granules regardless of the number you request.
      </div>
    );
  }

  return (
    <div>
      <h3>Confirm Your Download Order</h3>
      <p>
        Your download order is about to be submitted. You will be able to view
        the status of your order on the Orders page.
      </p>
      <button className="submit-button eui-btn--blue"
              onClick={props.onOK}>
        OK
      </button>
      <button className="cancel-button eui-btn--red"
              onClick={props.onCancel}>
        Cancel
      </button>
      {warningMessage}
    </div>
  );
};

interface IOrderErrorContentProps {
  error: any;
  onOK: () => void;
}

export const OrderErrorContent = (props: IOrderErrorContentProps) => {
  console.error(props.error);

  const msg = "We're sorry, but there was an error processing your request. " +
              "Please contact User Services (nsidc@nsidc.org) for further information and assistance. " +
              "User Services operates from 9:00 a.m. to 5 p.m. (MT).";
  return (
    <div>
      <h3>Something went wrong!</h3>
      <p>{msg}</p>
      <button className="submit-button eui-btn--red"
              onClick={props.onOK}>
        OK
      </button>
    </div>
  );
};

interface IOrderSuccessContentProps {
  environment: IEnvironment;
  onOK: () => void;
  response: any;
}

export const OrderSuccessContent = (props: IOrderSuccessContentProps) => {
  const orderId = props.response.message.order_id;
  return (
    <div>
      <h3>Order Received</h3>
      <p>
        Your download order has been submitted. You may view the status of your
        order ({orderId}) on the <a href={props.environment.urls.profileUrl}>Orders page</a>.
      </p>
      <button className="submit-button eui-btn--blue"
              onClick={props.onOK}>
        OK
      </button>
    </div>
  );
};

(OrderConfirmationContent as React.SFC).displayName = "OrderConfirmationContent";
(OrderErrorContent as React.SFC).displayName = "OrderErrorContent";
(OrderSuccessContent as React.SFC).displayName = "OrderSuccessContent";
