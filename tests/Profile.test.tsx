import { mount } from "enzyme";
import * as React from "react";

import { IOrderDetailsProps, IOrderDetailsState, OrderDetails } from "../src/components/OrderDetails";
import setupEnvironment from "../src/utils/environment";

const setup = () => {
  const orders: any = {
    "order1": {
      "collection_info": [["A Collection", "https://a.collection.url"]],
      "delivery": "esi",
      "fulfillment": "esi",
      "selection_criteria": {
        "include_granules": ["1 granule", "2 granule"],
      },
      "links": [],
      "order_id": "order1",
      "status": "complete",
      "timestamp": "2018-08-10T01:22:21.457Z",
    },
    "order2": {
      "collection_info": [["B Collection", "https://b.collection.url"]],
      "delivery": "esi",
      "fulfillment": "esi",
      "selection_criteria": {
        "include_granules": ["3 granule", "4 granule"],
      },
      "links": [],
      "order_id": "order2",
      "status": "complete",
      "timestamp": "2018-08-10T01:22:21.457Z",
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
      const oldProps: IOrderDetailsProps = {environment, orderId: undefined, initialLoadComplete: true};
      const oldState: IOrderDetailsState = {loading: false, order: undefined};
      const wrapper = mount(
        <OrderDetails {...oldProps} />,
      );
      const instance = wrapper.instance();
      instance.state = oldState;

      expect((instance.state as IOrderDetailsState).order).not.toBeDefined();
      expect((instance.props as IOrderDetailsProps).orderId).not.toBeDefined();

      const nextProps: IOrderDetailsProps = {environment, orderId: "order1"};
      expect(instance.shouldComponentUpdate!(nextProps, {}, {})).toBe(true);

      // Test the component state changes and renders expected HTML
      // TODO: Fix. Doesn't actually produce a state change or HTML change.
      /*
      console.log("Set props...");
      wrapper.setProps({orderId: "order1"});
      expect((instance.props as IOrderDetailsProps).orderId).toEqual("order1");
      expect((instance.state as IOrderDetailsState).order).toBeDefined();
      */
    });
  });
});
