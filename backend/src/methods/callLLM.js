const groq = require("./groq");
const gemini = require("./gemini");

// create a LLM class

async function initialize(model) {
  if (model.llm === "gemini") {
    return await gemini.setModelChain(model.model, model.api_key);
  } else if (model.llm === "groq") {
    return await groq.setModelChain(model.model, model.api_key);
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
  }
}

// export the LLM class
module.exports = { initialize, callLLM };
