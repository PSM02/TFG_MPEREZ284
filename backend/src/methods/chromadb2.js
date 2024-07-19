require("dotenv").config({ path: "backend/env/.env" });

const { SC_info } = require("../../data/SC_info.json");
const { ChromaClient } = require("chromadb");
const fetch = require("node-fetch");
const { InferenceApi } = require("@huggingface/inference");

huggingFaceApiKey = process.env.HUGGINGFACE_API_KEY;
const modelEndpoint =
  "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2";

async function getEmbedding(text) {
  let retries = 3; // Number of retries
  while (retries > 0) {
    const response = await fetch(modelEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${huggingFaceApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sentences: [text] }), // Corrected to send 'source_sentence' field
    });

    const data = await response.json();

    if (
      data.error &&
      data.error.includes(
        "Model sentence-transformers/all-MiniLM-L6-v2 is currently loading"
      )
    ) {
      retries--;
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
    } else if (data.error) {
      throw new Error(data.error);
    } else {
      return data[0].embedding; // Assuming the response contains an embedding
    }
  }

  throw new Error("Failed to fetch embedding: Model did not load in time.");
}

async function main() {
  // Initialize ChromaDB client
  const client = new ChromaClient();

  // Example text
  const text = "Hello, world!";

  // Get embedding (retry until model is loaded)
  const embedding = await getEmbedding(text);

  // Store the embedding in ChromaDB
  await client.upsert({
    collection: "my_collection",
    documents: [
      {
        id: "doc1",
        embedding: embedding,
        metadata: { text: text },
      },
    ],
  });

  console.log("Embedding stored successfully");
}

main().catch(console.error);
