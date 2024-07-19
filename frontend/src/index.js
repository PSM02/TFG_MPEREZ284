import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
//import Martin from "./pages/principal/Martin";
//import Register from "./pages/Register/Register";
import JsonOption from "./pages/json_option/JsonOption";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <JsonOption />
  </React.StrictMode>
);
