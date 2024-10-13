import React, { useState } from "react";

function OwnModelImput() {
  const [selectedModel, setSelectedModel] = useState({
    llm: "",
    model: "",
    api_key: "",
  });

  const handleChange = (event) => {
    const key = event.target.name;
    const value = event.target.value;
    setSelectedModel({ ...selectedModel, [key]: value });
  };

  const submitOwnModel = () => {
    let user = localStorage.getItem("user");
    fetch("http://localhost:3003/api/user/addOwnModel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: user,
        model: selectedModel,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        //clear inputs
        setSelectedModel({
          llm: "",
          model: "",
          api_key: "",
        });
        console.log(data);
      });
  };

  return (
    <div
      style={{ flexDirection: "column", display: "flex", marginTop: "30px" }}
      onChange={handleChange}
    >
      <h3 style={{ marginBottom: "20px" }}>Own Model Imput</h3>
      <h6>Imput your large lenguage model:</h6>
      <input
        type="text"
        name="llm"
        style={{ maxWidth: "300px", marginBottom: "10px" }}
      ></input>
      <h6>Imput your model:</h6>
      <input
        type="text"
        name="model"
        style={{ maxWidth: "300px", marginBottom: "10px" }}
      ></input>
      <h6>Imput your API-key:</h6>
      <input
        type="text"
        name="api_key"
        style={{ maxWidth: "300px", marginBottom: "20px" }}
      ></input>
      <button style={{ maxWidth: "300px" }} onClick={submitOwnModel}>
        Submit Model and Key
      </button>
    </div>
  );
}

export default OwnModelImput;
