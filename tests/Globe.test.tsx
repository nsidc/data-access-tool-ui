import { shallow } from "enzyme";
import * as React from "react";
jest.mock("../src/utils/CesiumAdapter");

import { Globe } from "../src/components/Globe";

const setup = () => {
  const props = {
    onSpatialSelectionChange: jest.fn(),
    resetSpatialSelection: jest.fn(),
    spatialSelection: {
      lower_left_lat: 0.0,
      lower_left_lon: 0.0,
      upper_right_lat: 0.0,
      upper_right_lon: 0.0,
    },
  };

  return {
    globe: shallow(<Globe {...props} />),
  };
};

describe("Globe component", () => {
  test("Renders a globe component", () => {
    const globe = setup().globe;
    expect(globe.find("#globe")).toEqual(expect.anything());
  });
});
