import {render} from "@testing-library/react"
import * as React from "react";
import '@testing-library/jest-dom';

jest.mock("../src/utils/CesiumAdapter");
import { Globe } from "../src/components/Globe";
import { BoundingBox } from "../src/types/BoundingBox";

const setup = () => {
  const props = {
    boundingBox: BoundingBox.global(),
    collectionSpatialCoverage: BoundingBox.global(),
    onBoundingBoxChange: jest.fn(),
    onSpatialSelectionChange: jest.fn(),
    setErrorMessage: jest.fn(),
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
      properties: {},
      type: "Feature",
    },
  };

  render(<Globe {...props} />)
};

describe("Globe component", () => {
  test("Renders a globe component", () => {
    setup()
    expect(document.querySelector("#globe")).toBeInTheDocument();
  });
});
