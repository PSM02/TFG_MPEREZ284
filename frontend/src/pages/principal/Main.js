import React from "react";
import "./Main.css";
import web_icon from "./imgs/web_icon.png";
import json_icon from "./imgs/json_icon.png";
import UpBar from "./bar/UpBar";
import { useNavigate } from "react-router-dom";
import LogedBar from "./bar/LogedBar";

function Main() {
  const navigate = useNavigate();
  const user = localStorage.getItem("user");

  return (
    <div className="App">
      {!user ? <UpBar /> : <LogedBar />}
      <h1 style={{ marginTop: "2cm" }}>Validate</h1>
      <div className="ButonBox">
        <div className="button-container">
          <button className="image-button" onClick={() => navigate("/webOp")}>
            <img src={web_icon} alt="Web Page"></img>
            Web Page
          </button>
        </div>
        <div className="button-container">
          <button className="image-button" onClick={() => navigate("/jsonOp")}>
            <img src={json_icon} alt="JSON"></img>
            JSON
          </button>
        </div>
      </div>
    </div>
  );
}

export default Main;
