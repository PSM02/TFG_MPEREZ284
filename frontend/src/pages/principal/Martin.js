import React from "react";
import "./Martin.css";
import web_icon from "./imgs/web_icon.png";
import json_icon from "./imgs/json_icon.png";
import UpBar from "./bar/UpBar";

function Martin() {
  return (
    <div className="App">
      <UpBar />
      <h1>Validate</h1>
      <div className="ButonBox">
        <div className="button-container">
          <button className="image-button">
            <img src={web_icon} alt="Web Page"></img>
            Web Page
          </button>
        </div>
        <div className="button-container">
          <button className="image-button">
            <img src={json_icon} alt="JSON"></img>
            JSON
          </button>
        </div>
      </div>
      <div className="changelog">
        <h2>Changelog</h2>
        {/* Add changelog information here */}
      </div>
    </div>
  );
}

export default Martin;
