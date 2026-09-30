import {render, screen} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import moment from "moment";
import * as React from "react";
import '@testing-library/jest-dom';

import { SubmitButton } from "../src/components/SubmitButton";

const setup = (setupProps = {}) => {
  const props = {
    buttonText: "Order List of Links",
    buttonId: "testButton",
    tooltip: <span></span>,
    disabled: false,
    collectionId: "abcd123",
    hoverText: "Once the order is processed, go to the Order page for a list of links to your files.",
    loggedOut: false,
    onGranuleResponse: jest.fn(),
    onSubmitOrder: jest.fn(),
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
    temporalLowerBound: moment(),
    temporalUpperBound: moment(),
    ...setupProps,
  };

  render(<SubmitButton {...props} />)
};

describe("Submit button component", () => {
  test("Renders submit button", () => {
    setup();
    expect(screen.getByRole("button")).toHaveTextContent("Order List of Links");
  });
});

describe("Click submit", () => {
  test("Responds to click", async () => {
    const onSubmitOrder = jest.fn();
    setup({onSubmitOrder});
    const button = screen.getByRole('button', { name: /order list of links/i });
    await userEvent.click(button);
    expect(onSubmitOrder).toHaveBeenCalled();
  });
});
