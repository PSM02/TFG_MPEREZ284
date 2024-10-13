const fetch = require("node-fetch");

async function correctTest(code) {
  try {
    const response = await fetch(
      "http://localhost:3003/service/results/json/alterTest",
      {
        method: "Post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: code }),
      }
    );
  } catch (error) {
    console.error("Error:", error);
  }
}

// Example usage
correctTest("J18");
