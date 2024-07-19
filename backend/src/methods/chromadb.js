require("dotenv").config({ path: "backend/env/.env" });

const {
  ChromaClient,
  GoogleGenerativeAiEmbeddingFunction,
} = require("chromadb");

// Initialize Chroma client
const client = new ChromaClient();

// Initialize Google embedding function
/* const embedder = new GoogleGenerativeAiEmbeddingFunction({
  googleApiKey: process.env.GOOGLE_API_KEY,
}); */

async function getCollection() {
  // Create or get a collection
  const collection = await client.getOrCreateCollection({
    name: "my_collection",
    //embeddingFunction: embedder,
  });

  return collection;
}

async function addDocuments(collection, info) {
  // Add info with their content prepended with keys and metadata
  await collection.add({
    ids: info.map((doc, index) => `doc${index}`),
    documents: info.map((doc) => doc.content),
    metadatas: info.map((doc) => ({ ...doc.keys })),
  });
}

async function clearCollection(collection) {
  // Delete all documents using an empty list
  await collection.delete({ ids: ["doc1", "doc0", "doc2"] });
}

async function searchDocuments(collection, query, keys) {
  try {
    const results = await collection.query({
      queryTexts: [query],
      nResults: 5,
    });
    return results;
  } catch (error) {}
}

// Example usage
async function main() {
  const collection = await getCollection();

  const documents = [
    { content: "This is a document about cats", keys: ["animals", "pets"] },
    { content: "This is a document about dogs", keys: ["animals", "pets"] },
    {
      content: "This is a document about cars",
      keys: ["vehicles", "transportation"],
    },
  ];

  await addDocuments(collection, documents);

  const searchResults = await searchDocuments(collection, "pet information");
  console.log(searchResults.metadatas);

  for (i = 0; i < searchResults.documents[0].length; i++) {
    console.log(searchResults.metadatas[0][i]);
    if (Object.values(searchResults.metadatas[0][i]).indexOf("pets") !== -1) {
      console.log(searchResults.documents[0][i]);
    }
  }

  //await clearCollection(collection);
}

main().catch(console.error);
