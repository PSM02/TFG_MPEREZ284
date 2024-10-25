require("dotenv").config({ path: "backend/env/.env" });

const { OpenAI } = require("@langchain/openai");

async function setModelChain(m, api_key) {
  const model = await new OpenAI({
    modelName: m,
    openAIApiKey: api_key || process.env.OPENAI_API_KEY,
    temperature: 0.01,
  });

  return model;
}

async function callLLM(chain, query) {
  result = await chain.invoke(query);
  return result;
}

module.exports = { setModelChain, callLLM };



