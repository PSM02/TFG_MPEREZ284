require("dotenv").config({ path: "env/.env" });

const mongojs = require("mongojs");

const db = mongojs(process.env.MONGODB_URI, [
  "users",
  "ResultJsons",
  "SC_info",
]);

// Add error handling for the database connection
db.on("error", function (err) {
  console.error("Database connection error:", err);
});

db.on("connect", function () {
  console.log("Database connected successfully");
});

module.exports = db;
