import { shallow } from "enzyme";
import * as fetchMock from "fetch-mock";
import { shim } from "promise.prototype.finally"
import * as React from "react";

import { ConfirmationFlow } from "../src/components/ConfirmationFlow";
import { OrderConfirmationContent } from "../src/components/ConfirmationContent";
import { OrderSubmissionParameters } from "../src/types/OrderSubmissionParameters";
import { OrderTypes } from "../src/types/orderTypes";
import setupEnvironment from "../src/utils/environment";

shim();

const environment = setupEnvironment(false);

fetchMock.mock(environment.urls.hermesOrderUrl, 200, {method: "POST"});

const setup = (props = {}) => {

  const defaultProps = {
    environment,
    onRequestClose: () => {},  // set props.show to false
    orderSubmissionParameters: undefined,
    orderType: undefined,
    show: true,
  };

  const finalProps = Object.assign({}, defaultProps, props)

  return shallow(<ConfirmationFlow {...finalProps} />);
};

describe("ConfirmationFlow", () => {
  test("Default child is OrderConfirmationContent", () => {
    const component = setup();

    expect(component.find(OrderConfirmationContent).length).toEqual(1);
  });

  test("shows spinner while order request is unresolved", async () => {
    expect.assertions(2);

    const mockShowLoadingIcon = jest.fn();
    ConfirmationFlow.prototype.showLoadingIcon = mockShowLoadingIcon;

    const mockHandleOrderResponse = jest.fn();
    ConfirmationFlow.prototype.handleOrderResponse = mockHandleOrderResponse;

    const mockHandleOrderError = jest.fn();
    ConfirmationFlow.prototype.handleOrderError = mockHandleOrderError;

    const component = setup({
      orderSubmissionParameters: new OrderSubmissionParameters(),
      orderType: OrderTypes.listOfLinks,
    });

    return component.instance().handleConfirmationClick().finally(() => {
      expect(mockShowLoadingIcon).toHaveBeenCalled();

      const numCalls = (mockedFunc: any) => mockedFunc.mock.calls.length;
      const orderHandlerCalls = numCalls(mockHandleOrderError) + numCalls(mockHandleOrderResponse);
      expect(orderHandlerCalls).toEqual(1);
    });
  });
});
