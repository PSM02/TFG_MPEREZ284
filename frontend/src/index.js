// App.js
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Main from "./pages/principal/Main";
import Register from "./pages/Register/Register";
import Login from "./pages/Login/Login";
import JsonOption from "./pages/json_option/fullJsonOption";
import WebOption from "./pages/web_option/fullWebOption";
import NoPage from "./pages/NoPage";
import UserPage from "./pages/UserPage/fullUserPage";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/jsonOp" element={<JsonOption />} />
        <Route path="*" element={<NoPage />} />
        <Route path="/userPage" element={<UserPage />} />
        <Route path="/webOp" element={<WebOption />} />
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

// Martin.js (unchanged)
