import * as React from "react";
import { shallow } from "enzyme";

import { SpatialSelectionToolbar } from "../src/components/SpatialSelectionToolbar";

test("Renders toolbar", () => {
  const toolbar = shallow(<SpatialSelectionToolbar/>);
  expect(toolbar.find("#toolbar")).toBeDefined();
});
