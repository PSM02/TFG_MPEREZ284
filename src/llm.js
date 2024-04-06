const { OpenAI } = require("@langchain/openai");

const model = new OpenAI({
    modelName: "gpt-3.5-turbo",
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.1,
});

module.exports = model;