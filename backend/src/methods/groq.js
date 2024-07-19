require("dotenv").config({ path: "backend/env/.env" });

const { ChatGroq } = require("@langchain/groq");
const { ChatPromptTemplate } = require("@langchain/core/prompts");

//GROQ LLM YOU WANT TO USE
const llm = "llama3-70b-8192";

const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: llm,
  temperature: 0.1,
});

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant"],
  ["human", "{input}"],
]);

const chain = prompt.pipe(model);

callLLM = async (input) => {
  const response = await chain.invoke({
    input,
  });
  return response;
};

module.exports = {
  callLLM,
  llm,
};
