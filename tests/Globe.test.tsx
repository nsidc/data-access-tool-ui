import { shallow } from "enzyme";
import * as React from "react";
jest.mock("../src/utils/CesiumAdapter");

import { Globe } from "../src/components/Globe";

const setup = () => {
  const props = {
    onSpatialSelectionChange: jest.fn(),
    collectionSpatialCoverage: {
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
