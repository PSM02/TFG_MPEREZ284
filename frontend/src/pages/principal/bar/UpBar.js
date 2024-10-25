import React from "react";
import { useNavigate } from "react-router-dom";
import "./UpBar.css";

function UpBar() {
  const navigate = useNavigate();
  const atHome = window.location.pathname === "/";
  return (
    <div className="login-bar">
      {/* Login/Register buttons or links here */}
      <button onClick={() => navigate("/login")}>Login</button>
      <button onClick={() => navigate("/register")}>Register</button>
      {!atHome && (
        <button className="home-button" onClick={() => navigate("/")}>
          Home
        </button>
      )}
    </div>
  );
}

export default UpBar;
