const LLM = require("./callLLM");
const axios = require("axios");
const sc_info = require("../../data/SC_info.json");

webInformationProvided1 = (testType, info) => {
  if (testType == "testsWithNothing") {
    return "<HTML>\n" + info.html + "\n</HTML>\n";
  } else if (testType == "testsWithWcagDescription") {
    return (
      "<HTML>\n" +
      info.html +
      "</HTML>\n" +
      "<RULE DESCRIPTION>\n" +
      info.ruleDesc +
      "</RULE DESCRIPTION>\n"
    );
  } else if (testType == "testsWithUnderstanding") {
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
  } else if (testType == "testsWithTechniques") {
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
  }
};

webMessage1 = (testType, html, rule, info) => {
  const { techniques, ...understanding } = info.understanding;
  conversationChainAplicable =
    "HUMAN:\n" +
    "just say APPLICABLE or INAPPLICABLE, if APPLICABLE say PASSED or FAILED and ALWAYS the HTML that made you decide\n" +
    "<INFORMATION PROVIDED>\n" +
    webInformationProvided1(testType, {
      html: html,
      ruleDesc: info.description,
      ruleUnderstanding: understanding,
      techniques: info.understanding.techniques,
    }) +
    "</INFORMATION PROVIDED>\n" +
    "<WHAT TO DO>\n" +
    "Tell me if wcag rule " +
    rule +
    " is aplicable or inapplicable to the html, if aplicable say if it passed or failed\n" +
    "</WHAT TO DO>\n" +
    "<HOW TO ANSWER>\n" +
    "just say APPLICABLE or INAPPLICABLE, if APPLICABLE say PASSED or FAILED and ALWAYS the HTML that made you decide\n" +
    "DONT GIVE ANY OTHER INFORMATION\n" +
    "</HOW TO ANSWER>\n";
  return conversationChainAplicable;
};

fetchHtml = async (url) => {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    console.error(`Error fetching HTML from ${url}:`, error);
    throw error;
  }
};

testWegPage = async (testType, target, model) => {
  // get the html from the url
  let html;
  if (target.url) {
    html = await fetchHtml(target.url);
  } else {
    html = target.html;
  }
  chain = await LLM.initialize(model);
  test = {};
  for (rule in sc_info) {
    question = webMessage1(testType, html, rule, sc_info[rule]);
    start_time_result = new Date().getTime();
    answer = await LLM.callLLM(question, chain);
    end_time_result = new Date().getTime();
    if (answer.includes("INAPPLICABLE")) {
      test[rule] = {
        answer: "INAPPLICABLE",
        time: end_time_result - start_time_result,
      };
    } else {
      //console.log(answer.substring(11, 17));
      test[rule] = {
        answer: answer.substring(11, 18),
        time: end_time_result - start_time_result,
        triggered_by: answer.substring(18),
      };
    }
    console.log("finished rule " + rule);
  }
  return test;
};

const main = async () => {
  // Your main function logic
  const r = await testWegPage(
    "testsWithWcagDescription",
    "https://example.com",
    "llama3-70b-8192"
  );
  console.log("Main function executed");
  return r;
};

//main();

module.exports = testWegPage;
