import * as React from "react";
import * as ReactDOM from "react-dom";

import "./index.css";

import { EverestProfile } from "./components/EverestProfile";

export const renderApp = () => {
  ReactDOM.render(
      <EverestProfile />,
      document.getElementById("everest-ui-profile"),
  );
};
