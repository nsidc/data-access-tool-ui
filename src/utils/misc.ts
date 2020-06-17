import * as moment from "moment";

export const orderExpirationTimestamp = (order: any): moment.Moment | null => {
  if (order.finalized_timestamp) {
    return moment(order.finalized_timestamp).clone().add(14, "days");
  } else if (["complete", "error", "warning"].includes(order.status)) {
    return moment(order.submitted_timestamp).clone().add(14, "days");
  }

  return null;
};
