import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Martin from "./pages/principal/Martin";
// use session to store user data

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Martin />
  </React.StrictMode>
);
