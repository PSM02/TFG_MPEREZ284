const express = require("express");
const cors = require("cors"); // Require the CORS library
const server = express();

server.use(cors()); // Enable CORS

// Parse JSON bodies (as sent by API clients)
server.use(express.json());

// Parse URL-encoded bodies (as sent by HTML forms)
server.use(express.urlencoded({ extended: true }));

const registerRoute = require("./routes/register");
const resultJson = require("./routes/resultsJson");

server.use("/api/auth/register", registerRoute);
server.use("/service/results/json", resultJson);

server.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!");
});

module.exports = server;
