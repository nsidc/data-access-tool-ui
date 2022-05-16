import * as React from "react";

import { IEnvironment } from "../../utils/environment";

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

// TODO profileUrl needs to reflect user id (or it must exist in local storage)
export const OrderSuccessContent = (props: IOrderSuccessContentProps) => {
  const orderId = props.response.order.order_id;
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

(OrderErrorContent as React.SFC).displayName = "OrderErrorContent";
(OrderSuccessContent as React.SFC).displayName = "OrderSuccessContent";
