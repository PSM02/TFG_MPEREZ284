require("dotenv").config({ path: "env/.env" });

const mongojs = require("mongojs");

const db = mongojs(process.env.MONGODB_URI, ["users", "ResultJsons", "data"]);

module.exports = db;
