require("dotenv").config({ path: "env/.env" });

const mongojs = require("mongojs");

const sc_info = require("../../data/sc_info.json");

const db = mongojs(process.env.MONGODB_URI, [
  "users",
  "ResultJsons",
  "SC_info",
]);

// Add error handling for the database connection
db.on("error", function (err) {
  console.error("Database connection error:", err);
});

module.exports = db;
