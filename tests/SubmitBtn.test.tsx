import { shallow } from "enzyme";
import * as moment from "moment";
import * as React from "react";

import { SubmitBtn } from "../src/components/SubmitBtn";

const setup = () => {
  const props = {
    collectionId: "abcd123",
    onGranuleResponse: jest.fn(),
    spatialSelection: {
      lower_left_lat: 0.0,
      lower_left_lon: 0.0,
      upper_right_lat: 0.0,
      upper_right_lon: 0.0,
    },
    temporalLowerBound: moment(),
    temporalUpperBound: moment(),
  };

  return {
    button: shallow(<SubmitBtn {...props} />),
  };
};

describe("Submit button component", () => {
  test("Renders submit button", () => {
    const button = setup().button;
    expect(button.find("button").text()).toEqual("Search");
  });
});

describe("Click submit", () => {
  test("Responds to click", () => {
    const mockClick = jest.fn();
    SubmitBtn.prototype.handleClick = mockClick;
    const button = setup().button;
    button.simulate("click");
    expect(mockClick).toHaveBeenCalled();
  });
});
