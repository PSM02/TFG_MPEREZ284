const LLM = require("./callLLM");
const axios = require("axios");
const searchTechniques = require("./chromadb");
const db = require("../methods/mongodb");

let sc_info;

db.SC_info.findOne({}, (err, doc) => {
  if (err) {
    console.log(err);
  } else {
    sc_info = doc;
  }
});

webInformationProvided = (info) => {
  info =
    "<HTML>\n" +
    info.html +
    "</HTML>\n" +
    "<RULE DESCRIPTION>\n" +
    info.ruleDesc +
    "</RULE DESCRIPTION>\n" +
    "<RULE UNDERSTANDING>\n" +
    present_understanding(info.ruleUnderstanding) +
    "</RULE UNDERSTANDING>\n";

  return info;
};

webMessage1 = (testType, html, rule) => {
  conversationChainAplicable =
    "<INFORMATION PROVIDED>\n" +
    webInformationProvided(testType, {
      html: html,
      ruleDesc: sc_info[rule].description,
      ruleUnderstanding: sc_info[rule].understanding,
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

webMessage2 = (testType, html, rule) => {
  conversationChainResult =
    "<INFORMATION PROVIDED>\n" +
    webInformationProvided(testType, {
      html: html,
      ruleDesc: sc_info[rule].description,
      ruleUnderstanding: sc_info[rule].understanding,
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

webTrimEdges = (str) => {
  return str.substring(1, str.length - 1);
};

function webManageResponse(jsonString) {
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
  result = webTrimEdges(result);
  description = fixed.split('"description":')[1];
  description = description.substring(1, description.length - 1);
  description = webTrimEdges(description);
  return { result: result, description: description };
}

webMessageApplicableForTechniques = (
  html,
  technique1,
  rule,
  previousResult
) => {
  conversationChainAplicable =
    "<INFORMATION PROVIDED>\n" +
    "<HTML>\n" +
    html +
    "</HTML>\n" +
    "<PREVIOUS>\n" +
    "<PREVIOUS RESULT>\n" +
    previousResult.result +
    "</PREVIOUS RESULT>\n" +
    "<JUSTIFICATION>\n" +
    previousResult.description +
    "</JUSTIFICATION>\n" +
    "</PREVIOUS>\n" +
    "<TECHNIQUE>\n" +
    technique1 +
    "</TECHNIQUE>\n" +
    "</INFORMATION PROVIDED>\n" +
    "<TASK>\n" +
    "You are a helpful assistant that, with the given information, decides if the WCAG rule " +
    rule +
    "is applicable or inapplicable to the HTML and provides the HTML portion that made you decide." +
    "<Specifics>\n" +
    "1. Review the HTML code provided within the <HTML> tag.\n" +
    "2. Analyze the HTML and WCAG rule details given in the <INFORMATION PROVIDED> tag.\n" +
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

webMessageContinueApplicableForTechniques = (
  html,
  technique,
  previousResult,
  previousTechnique,
  rule
) => {
  conversationChainAplicable =
    "<INFORMATION PROVIDED>\n" +
    "<HTML>\n" +
    html +
    "</HTML>\n" +
    "<TECHNIQUE>\n" +
    technique +
    "</TECHNIQUE>\n" +
    "<PREVIOUS>\n" +
    "<PREVIOUS RESULT>\n" +
    "<TECHNIQUE>\n" +
    previousTechnique +
    "</TECHNIQUE>\n" +
    "<RESULT>\n" +
    previousResult +
    "</RESULT>\n" +
    "</PREVIOUS RESULT>\n" +
    "</INFORMATION PROVIDED>\n" +
    "<TASK>\n" +
    "You are a helpful assistant that, with the given information, decides if the WCAG rule " +
    rule +
    "is applicable or inapplicable to the HTML and provides the HTML portion that made you decide." +
    "<Specifics>\n" +
    "1. Review the HTML code provided within the <HTML> tag.\n" +
    "2. Analyze the HTML and WCAG rule details given in the <INFORMATION PROVIDED> tag.\n" +
    "3. Decide if the" +
    rule +
    "still mantains the same result as the one given in the <RESULT> tag.\n" +
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

webMessageResultForTechniques = (html, technique1, rule, previousResult) => {
  conversationChainResult =
    "<INFORMATION PROVIDED>\n" +
    "<HTML>\n" +
    html +
    "</HTML>\n" +
    "<PREVIOUS>\n" +
    "<PREVIOUS RESULT>\n" +
    previousResult.result +
    "</PREVIOUS RESULT>\n" +
    "<JUSTIFICATION>\n" +
    previousResult.description +
    "</JUSTIFICATION>\n" +
    "</PREVIOUS>\n" +
    "<TECHNIQUE>\n" +
    technique1 +
    "</TECHNIQUE>\n" +
    "</INFORMATION PROVIDED>\n" +
    "<TASK>\n" +
    "You are a helpful assistant responsible for determining if the HTML has passed or failed the WCAG rule:" +
    rule +
    "Specifics:\n" +
    "1. Review the HTML code provided within the <HTML> tag.\n" +
    "2. Analyze the HTML and WCAG rule details given in the <INFORMATION PROVIDED> tag.\n" +
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

webMessageContinueResultForTechniques = (
  html,
  technique,
  previousResult,
  previousTechnique,
  rule
) => {
  conversationChainResult =
    "<INFORMATION PROVIDED>\n" +
    "<HTML>\n" +
    html +
    "</HTML>\n" +
    "<TECHNIQUE>\n" +
    technique +
    "</TECHNIQUE>\n" +
    "<PREVIOUS>\n" +
    "<PREVIOUS RESULT>\n" +
    "<TECHNIQUE>\n" +
    previousTechnique +
    "</TECHNIQUE>\n" +
    "<RESULT>\n" +
    previousResult +
    "</RESULT>\n" +
    "</PREVIOUS RESULT>\n" +
    "</INFORMATION PROVIDED>\n" +
    "<TASK>\n" +
    "You are a helpful assistant responsible for determining if the result of the HTML passing or failing the WCAG rule:" +
    rule +
    "is the same result as the one given in the <RESULT> tag:" +
    "\nSpecifics:\n" +
    "1. Review the HTML code provided within the <HTML> tag.\n" +
    "2. Analyze the HTML and WCAG rule details given in the <INFORMATION PROVIDED> tag.\n" +
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

webTechniquesQ = async (
  whatFor,
  html,
  criteria,
  chain,
  llm,
  lastTechniquePos,
  lastAnswer
) => {
  techniques = await searchTechniques(criteria);
  let result;
  console.log("Starting techniques for " + criteria);
  try {
    if (lastTechniquePos === 0) {
      desc_und =
        whatFor == "Applicable"
          ? webMessage1("Desc Undr", html, criteria)
          : webMessage2("Desc Undr", html, criteria);
      result = await LLM.callLLM(desc_und, chain, llm);
      result = webManageResponse(result);
      previousTechnique = techniques[0];
      message =
        whatFor == "Applicable"
          ? webMessageApplicableForTechniques(
              html,
              techniques[0],
              criteria,
              result
            )
          : webMessageResultForTechniques(
              html,
              techniques[0],
              criteria,
              result
            );
      result = await LLM.callLLM(message, chain, llm);
      result = webManageResponse(result);
      console.log(
        "Done with technique 1 of " +
          techniques.length +
          ", result: " +
          result.result
      );
      lastTechniquePos++;
    } else {
      result = lastAnswer;
      previousTechnique = techniques[lastTechniquePos - 1];
    }
    for (let i = lastTechniquePos; i < techniques.length; i++) {
      message =
        whatFor == "Applicable"
          ? webMessageContinueApplicableForTechniques(
              html,
              techniques[i],
              result.result,
              previousTechnique,
              criteria
            )
          : webMessageContinueResultForTechniques(
              html,
              techniques[i],
              result.result,
              previousTechnique,
              criteria
            );
      result = await LLM.callLLM(message, chain, llm);
      result = webManageResponse(result);
      console.log(
        "Done with technique " +
          (i + 1) +
          " of " +
          techniques.length +
          ", result: " +
          result.result
      );
      previousTechnique = techniques[i];
      lastTechniquePos++;
    }
    return [result, undefined];
  } catch (error) {
    console.log(error);
    return [result, lastTechniquePos];
  }
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

testWegPage = async (target, model) => {
  return await doWebTest(target, model, {}, 1, true, 0, undefined);
};

continueWebTest = async (model, results, lastTest) => {
  return await doWebTest(
    target,
    model,
    results,
    lastTest.lastCriteria,
    lastTest.testing_applicable,
    lastTest.lastTechniquePos,
    lastTest.lastAnswer
  );
};

doWebTest = async (
  target,
  model,
  final,
  cont,
  testing_applicable,
  lastTechniquePos,
  lastAnswer
) => {
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
  let stop = false;
  while (cont < criterias.length) {
    try {
      rule = criterias[cont];
      question = webMessage1(html, rule, sc_info[rule]);
      start_time_result = new Date().getTime();
      if (testing_applicable) {
        [applicable, lastTechniquePos] = await webTechniquesQ(
          "Applicable",
          html,
          rule,
          chain,
          model.llm,
          lastTechniquePos,
          lastAnswer
        );
        if (lastTechniquePos) {
          lastAnswer = applicable;
          throw new Error("Error in techniques");
        }
        if (applicable.result.toLowerCase() === "inapplicable") {
          stop = true;
          end_time_result = new Date().getTime();
          final[rule] = {
            answer: "inapplicable",
            time: end_time_result - start_time_result,
            triggered_by: applicable.description,
          };
        }
        lastAnswer = undefined;
        lastTechniquePos = 0;
      }

      if (!stop) {
        question = webMessage2(html, rule, sc_info[rule]);
        [result, lastTechniquePos] = await webTechniquesQ(
          "Result",
          html,
          rule,
          chain,
          model.llm,
          lastTechniquePos,
          lastAnswer
        );
        if (lastTechniquePos) {
          lastAnswer = result;
          throw new Error("Error in techniques");
        }
        end_time_result = new Date().getTime();
        final[rule] = {
          answer: result.result,
          time: end_time_result - start_time_result,
          triggered_by: result.description,
        };
        lastAnswer = undefined;
        lastTechniquePos = 0;
      }
      cont += 1;
      console.log("finished rule " + rule);
    } catch (error) {
      console.log("Error occurred in criteria: " + criterias[cont]);
      lastTest = {
        lastCriteria: cont,
        testing_applicable: testing_applicable,
        lastTechniquePos: lastTechniquePos,
        lastAnswer: lastAnswer,
      };
      return [final, lastTest];
    }
  }
  return [final, undefined];
};

module.exports = {
  testWegPage,
  continueWebTest,
};
