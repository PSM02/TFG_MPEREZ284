require("dotenv").config({ path: "env/.env" });

sc_info = require("../../data/sc_info.json");

// Import MongoClient
const { MongoClient } = require("mongodb");

// Connection URL
const url = process.env.MONGODB_CLIENT_URI;
const client = new MongoClient(url);

// Database Name
const dbName = process.env.MONGODB_DB_NAME;

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log("Connected successfully to server");

  const db = client.db(dbName);
  const collection = db.collection("SC_info");

  // Insert some documents
  const insertResult = await collection.insertOne(sc_info);
  console.log("Inserted documents =>", insertResult);

  // Close the connection
  await client.close();
}

main().catch(console.error);
