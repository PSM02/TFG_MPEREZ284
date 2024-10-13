const express = require("express");
const cors = require("cors"); // Require the CORS library
const server = express();

server.use(cors()); // Enable CORS

// Parse JSON bodies (as sent by API clients)
server.use(express.json({ limit: "50mb" }));

// Parse URL-encoded bodies (as sent by HTML forms)
server.use(express.urlencoded({ extended: true, limit: "50mb" }));

const registerRoute = require("./routes/register");
const loginRoute = require("./routes/login");
const resultJson = require("./routes/resultsJson");
const userRoute = require("./routes/user");

server.use("/api/auth/register", registerRoute);
server.use("/api/auth/login", loginRoute);
server.use("/service/results/json", resultJson);
server.use("/api/user", userRoute);

server.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!");
});

module.exports = server;
