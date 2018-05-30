import { shallow } from "enzyme";
import * as React from "react";
jest.mock("../src/utils/CesiumAdapter");

import { Globe } from "../src/components/Globe";

const extent = {
    lower_left_lat: 0.0,
    lower_left_lon: 0.0,
    upper_right_lat: 0.0,
    upper_right_lon: 0.0,
};

const props = {
  onSpatialSelectionChange: jest.fn(),
  resetSpatialSelection: jest.fn(),
  spatialSelection: extent,
};

describe("Globe component", () => {
  test("Renders a globe component", () => {
    const globe = shallow(<Globe {...props} />);
    expect(globe.find("#globe")).toEqual(expect.anything());
  });
});
