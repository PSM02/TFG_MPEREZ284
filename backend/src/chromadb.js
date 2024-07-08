require("dotenv").config({ path: "../env/.env" });
const { ChromaClient, OpenAIEmbeddingFunction } = require("chromadb");

async function setupCollection(client, embedder) {
  try {
    // Create or get a collection
    const collection = await client.createCollection({
      name: "my_collection",
      embeddingFunction: embedder,
    });
    return collection;
  } catch (error) {
    console.error("Error setting up collection:", error);
    throw error;
  }
}

async function addDocuments(collection, documents) {
  try {
    // Add documents with their content, metadata (including keys), and IDs
    await collection.add({
      ids: documents.map((doc, index) => `doc${index}`),
      documents: documents.map((doc) => doc.content),
      metadatas: documents.map((doc) => ({ keys: doc.keys })),
    });
  } catch (error) {
    console.error("Error adding documents:", error);
    throw error;
  }
}

async function searchDocuments(collection, query, keys) {
  try {
    // Search for documents that match the query and have the specified keys
    const results = await collection.query({
      queryTexts: [query],
      nResults: 5,
      whereDocument: {
        $and: [{ keys: { $containsAny: keys } }],
      },
    });
    return results;
  } catch (error) {
    console.error("Error searching documents:", error);
    throw error;
  }
}

// Example usage
async function main() {
  // Initialize Chroma client
  const client = new ChromaClient();

  // Initialize OpenAI embedding function (you'll need to set up your OpenAI API key)
  const embedder = new OpenAIEmbeddingFunction({
    openai_api_key: process.env.OPENAI_API_KEY,
  });

  try {
    const collection = await setupCollection(client, embedder);

    const documents = [
      { content: "This is a document about cats", keys: ["animals", "pets"] },
      { content: "This is a document about dogs", keys: ["animals", "pets"] },
      {
        content: "This is a document about cars",
        keys: ["vehicles", "transportation"],
      },
    ];

    await addDocuments(collection, documents);

    const searchResults = await searchDocuments(collection, "pet information", [
      "animals",
      "pets",
    ]);
    console.log(searchResults);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main().catch((error) => {
  console.error("Unhandled error:", error);
});
