import React, { useState } from "react";
import "../FormStile.css";
import llmList from "./llmOptions/llmList";

function UrlInput() {
  const [url, setUrl] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    // Here you would typically send the URL to your backend service
    console.log(`Testing URL: ${url}`);
  };

  const handleChange = (event) => {
    setUrl(event.target.value);
  };

  return (
    <div className="FormStile">
      <form onSubmit={handleSubmit}>
        <label>
          Enter URL:
          <input type="url" value={url} onChange={handleChange} />
        </label>
        <input type="submit" value="Test URL" />
      </form>
      <llmList />
    </div>
  );
}

export default UrlInput;
