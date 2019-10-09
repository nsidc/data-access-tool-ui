import { shallow } from "enzyme";
import * as React from "react";

import { SpatialSelectionToolbar } from "../src/components/SpatialSelectionToolbar";

describe("Spatial toolbar component", () => {
  test("Renders toolbar", () => {
    const toolbar = shallow(<SpatialSelectionToolbar
      onClickBoundingBox={() => jest.fn()}
      onClickHome={() => jest.fn()}
      onClickPolygon={() => jest.fn()}
      onClickReset={() => jest.fn()}/>);

    expect(toolbar.find("#toolbar")).toEqual(expect.anything());
  });
});
