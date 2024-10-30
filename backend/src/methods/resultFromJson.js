const fs = require("fs");
const LLM = require("./callLLM");
const searchTechniques = require("./chromadb");
const db = require("../methods/mongodb");
const { get } = require("http");

const htmlDir = "data/htmls/";

//const sc_info = require("../../data/sc_info.json");
getSC_info = async () => {
  await db.SC_info.findOne({}, (err, res) => {
    if (err) {
      console.log(err);
    } else {
      sc_info = res;
    }
  });
};

getSC_info();

informationProvided = (testType, info) => {
  returnInfo = "<HTML>\n" + info.html + "\n</HTML>\n";
  if (testType.includes("Desc")) {
    returnInfo +=
      "<RULE_DESCRIPTION>\n" + info.ruleDesc + "</RULE_DESCRIPTION>\n";
  }
  if (testType.includes("Undr")) {
    returnInfo +=
      "<RULE_UNDERSTANDING>\n" +
      present_understanding(info.ruleUnderstanding) +
      "</RULE_UNDERSTANDING>\n";
  }
  return returnInfo;
};

message1 = (testType, html, rule) => {
  conversationChainAplicable =
    "<INFORMATION PROVIDED>\n" +
    informationProvided(testType, {
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

message2 = (testType, html, rule) => {
  conversationChainResult =
    "<INFORMATION PROVIDED>\n" +
    informationProvided(testType, {
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

trimEdges = (str) => {
  return str.substring(1, str.length - 1);
};

function manageResponse(jsonString) {
  splited = false;
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
  while (!splited) {
    try {
      result = fixed.split('"result":')[1].split(",")[0].replace(" ", "");
      splited = true;
    } catch (error) {}
  }
  result = trimEdges(result);
  description = fixed.split('"description":')[1];
  description = description.substring(1, description.length - 1);
  description = trimEdges(description);
  description.replace(`\"`, "");
  return { result: result, description: description };
}

present_understanding = (understanding) => {
  return (
    "<INTENT>\n" +
    understanding.intent +
    "\n</INTENT>\n" +
    "<EXAMPLES>\n" +
    understanding.examples +
    "\n</EXAMPLES>\n" +
    "<TEST RULES>\n" +
    understanding["test-rules"] +
    "\n</TEST RULES>\n"
  );
};

messageApplicableForTechniques = (html, technique1, rule, previousResult) => {
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

messageContinueApplicableForTechniques = (
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

messageResultForTechniques = (html, technique1, rule, previousResult) => {
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

messageContinueResultForTechniques = (
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

techniquesQ = async (
  whatFor,
  html,
  criteria,
  chain,
  llm,
  lastTechniquePos,
  lastAnswer
) => {
  techniques = await searchTechniques(criteria);
  //for all techniques, replace \ with \\ to avoid errors
  techniques = techniques.map((t) => t.replace(/\\/g, "").replace(/"/g, ""));
  let result;
  console.log("Starting techniques for " + criteria);
  try {
    if (lastTechniquePos === 0) {
      desc_und =
        whatFor == "Applicable"
          ? message1("Desc Undr", html, criteria)
          : message2("Desc Undr", html, criteria);
      result = await LLM.callLLM(desc_und, chain, llm);
      result = manageResponse(result);
      previousTechnique = techniques[0];
      message =
        whatFor == "Applicable"
          ? messageApplicableForTechniques(
              html,
              techniques[0],
              criteria,
              result
            )
          : messageResultForTechniques(html, techniques[0], criteria, result);
      result = await LLM.callLLM(message, chain, llm);
      result = manageResponse(result);
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
          ? messageContinueApplicableForTechniques(
              html,
              techniques[i],
              result.result,
              previousTechnique,
              criteria
            )
          : messageContinueResultForTechniques(
              html,
              techniques[i],
              result.result,
              previousTechnique,
              criteria
            );
      result = await LLM.callLLM(message, chain, llm);
      result = manageResponse(result);
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

resultFromJson = async (testType, testsJson, model) => {
  return await doTest(testType, testsJson, model, {}, 0, 0, true, 0, undefined);
};

continueResultFromJson = async (
  testType,
  testsJson,
  model,
  results,
  lastTest
) => {
  let final = results;

  console.log(
    testsJson.testcases[lastTest.lastTest].ruleId +
      "_" +
      testsJson.testcases[lastTest.lastTest].testcaseId
  );

  return await doTest(
    testType,
    testsJson,
    model,
    final,
    lastTest.lastTest,
    lastTest.lastCriteria,
    lastTest.testing_applicable,
    lastTest.lastTechniquePos,
    lastTest.lastAnswer
  );
};

doTest = async (
  testType,
  testsJson,
  model,
  final,
  lastTestPos,
  lastCriteria,
  testing_applicable,
  lastTechniquePos,
  lastAnswer
) => {
  let chain = await LLM.initialize(model);
  let allTests = testsJson.testcases.length;
  let applicable;
  let result;
  let current_test = "";

  while (lastTestPos <= allTests) {
    try {
      let stop;
      for (let tc = lastTestPos; tc < allTests; tc++) {
        let element = testsJson.testcases[tc];
        if (!final[element.ruleId]) {
          final[element.ruleId] = {};
        }
        if (!final[element.ruleId][element.testcaseId]) {
          final[element.ruleId][element.testcaseId] = {};
        }
        current_test = element.ruleId + "_" + element.testcaseId;
        let html = htmlDir + current_test + ".html";
        html = await fs.readFileSync(html, "utf8");
        let criterias = Object.keys(element.ruleAccessibilityRequirements);
        let start_time_applicable;
        let end_time_applicable;
        let obj = {};
        for (let crit = lastCriteria; crit < criterias.length; crit++) {
          stop = false;
          lastCriteria = crit;
          let key = criterias[crit];
          if (testing_applicable) {
            start_time_applicable = new Date().getTime();
            let questionAplicable;
            if (testType.includes("Tech")) {
              [applicable, lastTechniquePos] = await techniquesQ(
                "Applicable",
                html,
                key,
                chain,
                model.llm,
                lastTechniquePos,
                lastAnswer
              );
              if (lastTechniquePos) {
                lastAnswer = applicable;
                throw new Error("Error in techniques");
              }
            } else {
              let questionAplicable = message1(testType, html, key);
              applicable = await LLM.callLLM(
                questionAplicable,
                chain,
                model.llm
              );
              applicable = manageResponse(applicable);
            }

            lastAnswer = undefined;
            lastTechniquePos = 0;

            if (applicable.result.toLowerCase() === "inapplicable") {
              stop = true;
              end_time_applicable = new Date().getTime();
              obj[key] = {
                result: "inapplicable",
                concreteHTML: applicable.description,
                expected: element.expected,
                time_applicable: end_time_applicable - start_time_applicable,
                prompt: questionAplicable,
              };
            }
          }

          if (!stop) {
            end_time_applicable = new Date().getTime();
            let time_applicable;
            if (!final[element.ruleId][element.testcaseId][key]) {
              time_applicable = end_time_applicable - start_time_applicable;
              final[element.ruleId][element.testcaseId][key] = time_applicable;
            } else {
              time_applicable = final[element.ruleId][element.testcaseId][key];
            }
            testing_applicable = false;
            let start_time_result = new Date().getTime();
            let question;
            if (testType.includes("Tech")) {
              [result, lastTechniquePos] = await techniquesQ(
                "Result",
                html,
                key,
                chain,
                model.llm,
                lastTechniquePos,
                lastAnswer
              );
              if (lastTechniquePos) {
                lastAnswer = result;
                throw new Error("Error in techniques");
              }
            } else {
              let question = message2(testType, html, key);
              result = await LLM.callLLM(question, chain, model.llm);
              result = manageResponse(result);
            }

            let end_time_result = new Date().getTime();
            let concreteResult =
              result.result.toLowerCase() === "passed" ||
              result.result.toLowerCase() === "passes"
                ? "passed"
                : "failed";
            obj[key] = {
              result: concreteResult,
              concreteHTML: result.description,
              expected: element.expected,
              time_result: end_time_result - start_time_result,
              time_applicable: time_applicable,
              prompt: question,
            };
            lastAnswer = undefined;
            lastTechniquePos = 0;
          }
          testing_applicable = true;
        }
        final[element.ruleId][element.testcaseId] = obj;
        console.log(
          testType + ": finished test " + lastTestPos + " of " + allTests
        );
        lastTestPos++;
        lastCriteria = 0;
      }

      break;
    } catch (error) {
      console.log("Error occurred in test: " + current_test);
      console.log(error);
      lastTest = {
        lastTest: lastTestPos,
        lastCriteria: lastCriteria,
        testing_applicable: testing_applicable,
        lastTechniquePos: lastTechniquePos,
        lastAnswer: lastAnswer,
      };
      return [final, lastTest];
    }
  }

  console.log("=====================================");
  console.log("             FINISHED");
  console.log("=====================================");

  return [final, undefined];
};

module.exports = {
  resultFromJson,
  continueResultFromJson,
};
