const LLM = require("./callLLM");
const axios = require("axios");
const sc_info = require("../../data/SC_info.json");

webInformationProvided = (info) => {
  return (
    "<HTML>\n" +
    info.html +
    "</HTML>\n" +
    "<RULE DESCRIPTION>\n" +
    info.ruleDesc +
    "</RULE DESCRIPTION>\n"
  );
  return (
    "<HTML>\n" +
    info.html +
    "</HTML>\n" +
    "<RULE DESCRIPTION>\n" +
    info.ruleDesc +
    "</RULE DESCRIPTION>\n" +
    "<RULE UNDERSTANDING>\n" +
    present_understanding(info.ruleUnderstanding) +
    "</RULE UNDERSTANDING>\n"
  );
  return (
    "<HTML>\n" +
    info.html +
    "</HTML>\n" +
    "<RULE DESCRIPTION>\n" +
    info.ruleDesc +
    "</RULE DESCRIPTION>\n" +
    "<RULE UNDERSTANDING>\n" +
    present_understanding(info.ruleUnderstanding) +
    "</RULE UNDERSTANDING>\n" +
    "<RULE TECHNIQUES>\n" +
    present_techniques(info.techniques) +
    "</RULE TECHNIQUES>\n"
  );
};

webMessage1 = (html, rule, info) => {
  const { techniques, ...understanding } = info.understanding;
  conversationChainAplicable =
    "HUMAN:\n" +
    "just say APPLICABLE or INAPPLICABLE, if APPLICABLE say PASSED or FAILED and ALWAYS the HTML that made you decide\n" +
    "<INFORMATION PROVIDED>\n" +
    webInformationProvided({
      html: html,
      ruleDesc: info.description,
      ruleUnderstanding: understanding,
      techniques: info.understanding.techniques,
    }) +
    "</INFORMATION PROVIDED>\n" +
    "<TASK>\n" +
    "You are a helpful assistant that, with the given information, decides if the WCAG rule " +
    rule +
    "is applicable or inapplicable to the HTML and provides the HTML portion that made you decide." +
    "<Specifics>\n" +
    "1. Review the HTML code provided within the <HTML> tag.\n" +
    "2. Analyze the WCAG rule details given in the <RULE_DESCRIPTION>, <RULE_UNDERSTANDING> and <RULE_TECHNIQUES> tags.\n" +
    "3. Decide if the" +
    rule +
    "is applicable or inapplicable to the HTML structure.\n" +
    "4. Highlight the section of the HTML that helped you make your decision.\n" +
    "</Specifics>\n" +
    "<ANSWER_FORMAT>\n" +
    'You should return a VALID JSON object with two fields: "result" and "description"\n' +
    '"result" can only have 2 possible values: "applicable" or "inapplicable"\n' +
    "(depending on whether the current success criterion is applicable or inapplicable to the Html).\n" +
    '"description" must record the reasoning behind the result and THE HTML portion that made you decide."\n';
  "</ANSWER_FORMAT>\n" + "</TASK>\n";
  return conversationChainAplicable;
};

webMessage2 = (html, rule, info) => {
  const { techniques, ...understanding } = sc_info[rule].understanding;
  conversationChainResult =
    "<INFORMATION PROVIDED>\n" +
    webInformationProvided({
      html: html,
      ruleDesc: sc_info[rule].description,
      ruleUnderstanding: understanding,
      techniques: sc_info[rule].understanding.techniques,
    }) +
    "</INFORMATION PROVIDED>\n" +
    "<TASK>\n" +
    "You are a helpful assistant responsible for determining if the HTML has passed or failed the WCAG rule:" +
    rule +
    "Specifics:\n" +
    "1. Review the HTML code provided within the <HTML> tag.\n" +
    "2. Analyze the WCAG rule details given in the <RULE_DESCRIPTION>, <RULE_UNDERSTANDING> and <RULE_TECHNIQUES> tags.\n" +
    "3. Decide if the HTML has PASSED or FAILED rule" +
    rule +
    ".\n4. Highlight the section of the HTML that helped you make your decision.\n" +
    "<ANSWER_FORMAT>\n" +
    'You should return a VALID JSON object with two fields: "result" and "description"\n' +
    '"result" can only have 2 possible values: "passed" or failed"\n' +
    "(depending on whether the Html has passed or failed the current succes criterion).\n" +
    '"description" must record the reasoning behind the resultand THE HTML portion that made you decide."\n';
  "</ANSWER_FORMAT>\n" + "</TASK>\n";
  return conversationChainResult;
};

trimEdges = (str) => {
  return str.substring(1, str.length - 1);
};

function manageResponse(jsonString) {
  fixed = jsonString.replace(/[\r\n\t]/g, (match) => {
    switch (match) {
      case "\r":
        return "";
      case "\n":
        return "";
      case "\t":
        return "";
      default:
        return match;
    }
  });
  result = fixed.split('"result":')[1].split(",")[0].replace(" ", "");
  result = trimEdges(result);
  description = fixed.split('"description":')[1];
  description = description.substring(1, description.length - 1);
  description = trimEdges(description);
  return { result: result, description: description };
}

fetchHtml = async (url) => {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    console.error(`Error fetching HTML from ${url}:`, error);
    throw error;
  }
};

testWegPage = async (target, model) => {
  return await doWebTest(target, model, {}, 1);
};

continueWebTest = async (model, results, lastCrit) => {
  crits = Object.keys(sc_info);
  cont = crits.indexOf(lastCrit);
  return await doWebTest(target, model, results, cont);
};

doWebTest = async (target, model, final, cont) => {
  let html;
  if (target.url) {
    html = await fetchHtml(target.url);
  } else {
    html = target.html;
  }
  console.log(html);
  chain = await LLM.initialize(model);
  criterias = Object.keys(sc_info);
  let applicable;
  let result;
  while (cont < criterias.length) {
    try {
      rule = criterias[cont];
      question = webMessage1(html, rule, sc_info[rule]);
      start_time_result = new Date().getTime();
      applicable = await LLM.callLLM(question, chain, model.llm);
      applicable = manageResponse(applicable);
      if (applicable.result.toLowerCase() === "inapplicable") {
        end_time_result = new Date().getTime();
        final[rule] = {
          answer: "inapplicable",
          time: end_time_result - start_time_result,
          triggered_by: applicable.description,
        };
      } else {
        question = webMessage2(html, rule, sc_info[rule]);
        result = await LLM.callLLM(question, chain, model.llm);
        end_time_result = new Date().getTime();
        result = manageResponse(result);
        final[rule] = {
          answer: result.result,
          time: end_time_result - start_time_result,
          triggered_by: result.description,
        };
      }
      cont += 1;
      console.log("finished rule " + rule);
    } catch (error) {
      console.error(`Error testing rule ${rule}:`, error);
      return [final, rule];
    }
  }
  return [final, undefined];
};

const main = async () => {
  // Your main function logic
  const r = await testWegPage(
    { url: "https://example.com" },
    "llama3-70b-8192"
  );
  console.log("Main function executed");
  return r;
};

//main();

module.exports = {
  testWegPage,
  continueWebTest,
};
