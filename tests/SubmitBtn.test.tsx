import * as React from "react";
import { shallow } from "enzyme";

import { SubmitBtn } from "../src/components/SubmitBtn";

test("Renders submit button", () => {
  const button = shallow(<SubmitBtn />);
  expect(button.find("button").text()).toEqual("Submit");
});
