require("dotenv").config({ path: "backend/env/.env" });

const { ChatGroq } = require("@langchain/groq");
const { ChatPromptTemplate } = require("@langchain/core/prompts");

setModelChain = async (m, api_key) => {
  model = new ChatGroq({
    apiKey: api_key || process.env.GROQ_API_KEY,
    model: m,
    temperature: 0.5,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful assistant"],
    ["human", "{input}"],
  ]);

  const chain = await prompt.pipe(model);

  return chain;
};

callLLM = async (chain, input) => {
  const response = await chain.invoke({
    input,
  });
  return response;
};

module.exports = {
  callLLM,
  setModelChain,
};
