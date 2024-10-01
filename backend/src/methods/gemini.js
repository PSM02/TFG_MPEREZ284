require("dotenv").config({ path: "backend/env/.env" });

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_STUDIO_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

callLLM = async (query) => {
  const result = await model.generateContent(query);
  return result;
};

module.exports = {
  callLLM,
};
