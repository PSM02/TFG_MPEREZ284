import React, { useState } from "react";
import "../FormStile.css";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    let jsonData = {
      username: username,
      password: password,
    };
    fetch("http://localhost:3001/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    }).then((response) => {
      response.json().then((data) => {
        if (data.message === "Login successful!") {
          localStorage.setItem("user", username);
        }
        alert(data.message);
        navigate("/");
      });
    });
  };

  return (
    <div className="FormStile">
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <input type="submit" value="Login" />
      </form>
    </div>
  );
}

export default Login;