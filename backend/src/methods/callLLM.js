const groq = require("./groq");
const gemini = require("./gemini");
const openai = require("./openAI");

async function initialize(model) {
  if (model.llm === "gemini") {
    return await gemini.setModelChain(model.model, model.api_key);
  } else if (model.llm === "groq") {
    return await groq.setModelChain(model.model, model.api_key);
  } else if (model.llm === "openai") {
    return await openai.setModelChain(model.model, model.api_key);
  }
}

async function callLLM(question, chain, llm) {
  let res;
  if (llm === "gemini") {
    res = await gemini.callLLM(chain, question);
    return res.response.text();
  } else if (llm === "groq") {
    res = await groq.callLLM(chain, question);
    return res.content;
  } else if (llm === "openai") {
    res = await openai.callLLM(chain, question);
    return res.choices[0].text;
  }
}

// export the LLM class
module.exports = { initialize, callLLM };
