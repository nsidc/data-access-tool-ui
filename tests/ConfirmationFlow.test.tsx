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

  describe("with a failing submit order request", () => {
    let mockShowLoadingIcon: any;
    let mockHandleOrderError: any;

    const describedComponent = setup({
      orderSubmissionParameters: new OrderSubmissionParameters(),
      orderType: OrderTypes.listOfLinks,
    });

    beforeAll(() => {
      fetchMock.mock(environment.urls.hermesOrderUrl, 500, {method: "POST"});

      mockShowLoadingIcon = jest.fn();
      // @ts-ignore TS2341
      ConfirmationFlow.prototype.showLoadingIcon = mockShowLoadingIcon;

      mockHandleOrderError = jest.fn();
      // @ts-ignore TS2341
      ConfirmationFlow.prototype.handleOrderError = mockHandleOrderError;
    });

    afterEach(() => {
      mockShowLoadingIcon.mockReset();
      mockHandleOrderError.mockReset();
    });

    afterAll(() => {
      fetchMock.restore();
      mockShowLoadingIcon.mockRestore();
      mockHandleOrderError.mockRestore();
    });

    test("shows spinner and then handles the error", async () => {
      expect.assertions(2);

      // @ts-ignore TS2339
      return describedComponent.instance().handleConfirmationClick().finally(() => {
        expect(mockShowLoadingIcon).toHaveBeenCalled();
        expect(mockHandleOrderError).toHaveBeenCalled();
      });
    });
  });
});
