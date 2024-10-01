const groq = require("./groq");
const gemini = require("./gemini");

// create a LLM class

async function initialize(model) {
  if (model === "gemini-1.5-flash") {
    return "gemini-1.5-flash";
  } else {
    return await groq.setModelChain(model);
  }
}

async function callLLM(question, chain) {
  let res;
  if (chain === "gemini-1.5-flash") {
    res = await gemini.callLLM(question);
    return res.response.text();
  } else {
    res = await groq.callLLM(chain, question);
    return res.content;
  }
}

// export the LLM class
module.exports = { initialize, callLLM };
