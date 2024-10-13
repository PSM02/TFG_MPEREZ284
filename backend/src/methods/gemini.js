require("dotenv").config({ path: "backend/env/.env" });

const { GoogleGenerativeAI } = require("@google/generative-ai");

async function setModelChain(m, api_key) {
  if (!api_key) {
    api_key = process.env.GOOGLE_AI_STUDIO_API_KEY;
  }

  const genAI = new GoogleGenerativeAI(api_key);

  // Use async/await to handle the promise returned by getGenerativeModel
  const chain = await genAI.getGenerativeModel({ model: m });

  return chain;
}

callLLM = async (chain, query) => {
  const result = await chain.generateContent(query);
  return result;
};

module.exports = {
  callLLM,
  setModelChain,
};
