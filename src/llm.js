const { OpenAI } = require("@langchain/openai");

const model = new OpenAI({
    modelName: "gpt-4-vision-preview",
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.5,
});

module.exports = model;