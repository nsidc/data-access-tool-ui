import {render} from "@testing-library/react"
import * as React from "react";
import '@testing-library/jest-dom';

import { SpatialSelectionToolbar } from "../src/components/SpatialSelectionToolbar";

describe("Spatial toolbar component", () => {
  test("Renders toolbar", () => {
    render(<SpatialSelectionToolbar
      disableExport={false}
      disableReset={false}
      onClickBoundingBox={jest.fn()}
      onClickExportPolygon={jest.fn()}
      onClickHome={jest.fn()}
      onClickImportPolygon={jest.fn()}
      onClickPolygon={jest.fn()}
      onClickReset={jest.fn()}/>);

    expect(document.querySelector("#toolbar")).toBeInTheDocument();
  });
});
