import React from "react";
import "./UpBar.css";
import { useNavigate } from "react-router-dom";

export default function LogedBar() {
  const navigate = useNavigate();

  const username = localStorage.getItem("user");

  const atHome = window.location.pathname === "/";

  const logOut = () => {
    localStorage.clear();
    if (window.location.pathname === "/userPage") {
      navigate("/");
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="login-bar">
      <button
        onClick={() => {
          navigate("/userPage");
        }}
      >
        {username}
      </button>
      <button onClick={logOut}>Logout</button>
      {!atHome && (
        <button className="home-button" onClick={() => navigate("/")}>
          Home
        </button>
      )}
    </div>
  );
}
