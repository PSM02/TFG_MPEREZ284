import React from "react";
import "./Martin.css";
import Register from "../Register/Register";

function Martin() {
  return (
    <div className="Martin">
      <header className="Martin-header">
        <h1>Welcome to Martin's Website</h1>
        <p>This is the presentation page for Martin's website.</p>
        <p>
          This website is an accessibility tester for web pages. Register to
          start testing your web pages for accessibility issues.
        </p>
      </header>
      <Register />
    </div>
  );
}

export default Martin;
