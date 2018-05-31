import { shallow } from "enzyme";
import * as React from "react";

import { SpatialSelectionToolbar } from "../src/components/SpatialSelectionToolbar";

describe("Spatial toolbar component", () => {
  test("Renders toolbar", () => {
    const toolbar = shallow(<SpatialSelectionToolbar onSelectionStart={() => jest.fn()}
                                                     onResetClick={() => jest.fn()}/>);

    expect(toolbar.find("#toolbar")).toBeDefined();
  });
});
