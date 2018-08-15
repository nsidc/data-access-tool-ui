import { mount } from "enzyme";
import * as React from "react";

import { OrderDetails } from "../src/components/OrderDetails";
import setupEnvironment from "../src/utils/environment";

const setup = () => {
  const orders: any = {
    "order1": {
      "collection_info": [["A Collection", "https://a.collection.url"]],
      "date": 1533864141.4570563,
      "destination": "archive",
      "granule_URs": ["1 granule", "2 granule"],
      "links": [],
      "order_id": "order1",
      "status": "complete",
    },
    "order2": {
      "collection_info": [["B Collection", "https://b.collection.url"]],
      "date": 1533864141.4570563,
      "destination": "archive",
      "granule_URs": ["3 granule", "4 granule"],
      "links": [],
      "order_id": "order2",
      "status": "complete",
    },
  };
  const environment = Object.assign(setupEnvironment(false), {
    hermesAPI: {
      getOrder: jest.fn((orderId: string) => Promise.resolve(orders[orderId])),
      getUserOrders: jest.fn(() => Promise.resolve(orders)),
      openNotificationConnection: jest.fn(),
    },
  });
  return {
    environment,
  };
};

describe("The user profile", () => {
  describe("OrderDetails", () => {
    it("should update when new order selected", () => {
      const environment = setup().environment;
      const oldProps = {environment, orderId: undefined};
      const wrapper = mount(
        <OrderDetails {...oldProps} />
      );
      const instance = wrapper.instance();

      expect(instance.state.order).not.toBeDefined();
      expect(instance.props.orderId).not.toBeDefined();

      const nextProps: any = {environment, orderId: "order1"};
      expect(instance.shouldComponentUpdate!(nextProps, {}, {})).toBe(true);

      // Test the component state changes and renders expected HTML
      // TODO: Fix. Doesn't actually produce a state change or HTML change.
      /*
      console.log("Set props...");
      wrapper.setProps({orderId: "order1"});
      expect(instance.props.orderId).toEqual("order1");
      expect(instance.state.order).toBeDefined();
      */
    });
  });
});
