import { StrictMode } from "react";
import ReactDOM from "react-dom";
import React, { useState, useEffect } from "react";
import App from "./App";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  rootElement
);
