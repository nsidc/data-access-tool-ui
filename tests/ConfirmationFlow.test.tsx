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
    ensureGranuleScrollDepleted: () => {},
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

  describe("with a submit order request", () => {
    let mockShowLoadingIcon: any;
    let mockHandleOrderError: any;
    let mockHandleOrderResponse: any;

    const describedComponent = setup({
      orderSubmissionParameters: new OrderSubmissionParameters(),
      orderType: OrderTypes.listOfLinks,
    });

    beforeAll(() => {
      mockShowLoadingIcon = jest.fn();
      // @ts-ignore TS2341
      ConfirmationFlow.prototype.showLoadingIcon = mockShowLoadingIcon;

      mockHandleOrderError = jest.fn();
      // @ts-ignore TS2341
      ConfirmationFlow.prototype.handleOrderError = mockHandleOrderError;

      mockHandleOrderResponse = jest.fn();
      // @ts-ignore TS2341
      ConfirmationFlow.prototype.handleOrderResponse = mockHandleOrderResponse;
    });

    afterEach(() => {
      mockShowLoadingIcon.mockReset();
      mockHandleOrderError.mockReset();
    });

    afterAll(() => {
      mockShowLoadingIcon.mockRestore();
      mockHandleOrderError.mockRestore();
    });

    describe("that is successful", () => {
      beforeEach(() => {
        const matcher = environment.urls.hermesOrderUrl;
        const response = {status: 200, body: "{}"};
        const options = {method: "POST"};

        fetchMock.mock(matcher, response, options);
      });

      afterEach(() => {
        fetchMock.restore();
      });

      test("shows spinner and then handles the response", async () => {
        // @ts-ignore TS2339
        return describedComponent.instance().handleConfirmationClick().finally(() => {
          expect(mockShowLoadingIcon).toHaveBeenCalled();
          expect(mockHandleOrderResponse).toHaveBeenCalled();
        });
      })
    });

    describe("that fails", () => {
      beforeEach(() => {
        const matcher = environment.urls.hermesOrderUrl;
        const response = {status: 500};
        const options = {method: "POST"};

        fetchMock.mock(matcher, response, options);
      });

      afterEach(() => {
        fetchMock.restore();
      });

      test("shows spinner and then handles the error", async () => {
        // @ts-ignore TS2339
        return describedComponent.instance().handleConfirmationClick().finally(() => {
          expect(mockShowLoadingIcon).toHaveBeenCalled();
          expect(mockHandleOrderError).toHaveBeenCalled();
        });
      });
    });
  });
});
