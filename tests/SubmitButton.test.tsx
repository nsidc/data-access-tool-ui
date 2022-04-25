import { shallow } from "enzyme";
import * as moment from "moment";
import * as React from "react";

import { SubmitButton } from "../src/components/SubmitButton";

const setup = (setupProps = {}) => {
  const props = {
    buttonText: "Order List of Links",
    buttonId: "testButton",
    tooltip: <span></span>,
    disabled: false,
    collectionId: "abcd123",
    hoverText: "Once the order is processed, go to the Order page for a list of links to your files.",
    loggedOut: false,
    onGranuleResponse: jest.fn(),
    onSubmitOrder: jest.fn(),
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
    ...setupProps,
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
    const onSubmitOrder = jest.fn();
    const button = setup({onSubmitOrder}).button.find("button");
    button.simulate("click");
    expect(onSubmitOrder).toHaveBeenCalled();
  });
});
