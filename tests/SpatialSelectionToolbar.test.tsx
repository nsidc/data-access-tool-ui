import { shallow } from "enzyme";
import * as React from "react";

import { SpatialSelectionToolbar } from "../src/components/SpatialSelectionToolbar";

describe("Spatial toolbar component", () => {
  test("Renders toolbar", () => {
    const mockSelection = jest.fn();
    const mockReset = jest.fn();
    const toolbar = shallow(<SpatialSelectionToolbar onSelectionStart={() => mockSelection}
                                                     onResetClick={() => mockReset}/>);

    expect(toolbar.find("#toolbar")).toBeDefined();
  });
});
