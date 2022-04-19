import * as React from "react";
import { render } from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { App } from "./App";
import { EverestUI } from "./components/EverestUI";
import { EverestProfile } from "./components/EverestProfile";
import setupEnvironment from "./utils/environment";

const rootElement = document.getElementById("data-access-tool");
render(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} >
          <Route path="/order" element={<EverestUI environment={setupEnvironment(false)}/>} />
          <Route path="/order-history" element={<EverestProfile environment={setupEnvironment(false)} />} />
        </Route>
      </Routes>
    </BrowserRouter>,
    rootElement
);
