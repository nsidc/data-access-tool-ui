import { shallow } from "enzyme";
import * as moment from "moment";
import * as React from "react";

import { SubmitButton } from "../src/components/SubmitButton";
import { OrderTypes } from "../src/types/orderTypes";

const setup = () => {
  const props = {
    collectionId: "abcd123",
    onGranuleResponse: jest.fn(),
    onSubmitOrderResponse: jest.fn(),
    orderType: OrderTypes.listOfLinks,
    spatialSelection: {
      bbox: [0, 0, 0, 0],
      geometry: {
        coordinates: [[
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
        ]],
        type: "Polygon",
      },
      type: "Feature",
    },
    temporalLowerBound: moment(),
    temporalUpperBound: moment(),
  };

  return {
    button: shallow(<SubmitButton {...props} />),
  };
};

describe("Submit button component", () => {
  test("Renders submit button", () => {
    const button = setup().button;
    expect(button.find("button").text()).toEqual("Order List of Links");
  });
});

describe("Click submit", () => {
  test("Responds to click", () => {
    const mockClick = jest.fn();
    SubmitButton.prototype.handleClick = mockClick;
    const button = setup().button;
    button.simulate("click");
    expect(mockClick).toHaveBeenCalled();
  });
});
