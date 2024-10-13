const fs = require("fs");
const LLM = require("./callLLM");
const searchTechniques = require("./chromadb");

const htmlDir = "data/htmls/";
const sc_info = require("../../data/SC_info.json");
//const Tests = require("../../data/test/sampleTestJson.json");

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
  if (testType.includes("Tech")) {
    returnInfo +=
      "<RULE_TECHNIQUES>\n" +
      present_techniques(info.techniques) +
      "</RULE_TECHNIQUES>\n";
  }
  return returnInfo;
};

message1 = (testType, html, rule) => {
  const { techniques, ...understanding } = sc_info[rule].understanding;
  conversationChainAplicable =
    "<INFORMATION PROVIDED>\n" +
    informationProvided(testType, {
      html: html,
      ruleDesc: sc_info[rule].description,
      ruleUnderstanding: understanding,
      techniques: techniques,
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
  const { techniques, ...understanding } = sc_info[rule].understanding;
  conversationChainResult =
    "<INFORMATION PROVIDED>\n" +
    informationProvided(testType, {
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

present_techniques = (techniques) => {
  textTechniques = "";
  for (i in techniques) {
    tech = techniques[i];
    techID = tech.split(":")[0];
    //techText is the rest of the string after the first double point
    techText = tech.split(":").slice(1).join("");
    textTechniques +=
      "<" + techID + ">\n" + techText + "\n" + "</" + techID + ">\n";
  }
  return textTechniques;
};

messageApplicableForTechniques = (html, technique1, rule) => {
  informationProvided;
  conversationChainAplicable =
    "<INFORMATION PROVIDED>\n" +
    "<HTML>\n" +
    html +
    "</HTML>\n" +
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

messageResultForTechniques = (html, technique1, rule) => {
  conversationChainResult =
    "<INFORMATION PROVIDED>\n" +
    "<HTML>\n" +
    html +
    "</HTML>\n" +
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

techniquesQ = async (whatFor, html, criteria, chain, llm) => {
  techniques = await searchTechniques(criteria);
  console.log(techniques);
  prebiousTechnique = techniques[0];
  message =
    whatFor == "Applicable"
      ? messageApplicableForTechniques(html, techniques[0], criteria)
      : messageResultForTechniques(html, techniques[0], criteria);
  result = await LLM.callLLM(message, chain, llm);
  result = manageResponse(result);
  console.log(
    "Done with technique 1 of " +
      techniques.length +
      ", result: " +
      result.result
  );
  for (let i = 1; i < techniques.length; i++) {
    message =
      whatFor == "Applicable"
        ? messageContinueApplicableForTechniques(
            html,
            techniques[i],
            result.result,
            prebiousTechnique,
            criteria
          )
        : messageContinueResultForTechniques(
            html,
            techniques[i],
            result.result,
            prebiousTechnique,
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
    prebiousTechnique = techniques[i];
  }
  return result;
};

resultFromJson3 = async (testType, testsJson, model) => {
  chain = await LLM.initialize(model);
  final = {};
  testsJson = originalTests;
  current_test = "";
  allTests = testsJson.testcases.length;
  cont = 1;
  try {
    for (tc in testsJson.testcases) {
      element = testsJson.testcases[tc];
      if (final[element.ruleId] == undefined) {
        final[element.ruleId] = {};
      }
      current_test = element.ruleId + "_" + element.testcaseId;
      html = htmlDir + current_test + ".html";
      html = fs.readFileSync(html, "utf8");
      stop = false;
      criterias = Object.keys(element.ruleAccessibilityRequirements);
      for (i in criterias) {
        key = criterias[i];
        questionAplicable = message1(testType, html, key);
        start_time_applicable = new Date().getTime();
        aplicable = await LLM.callLLM(questionAplicable, chain);
        if (aplicable.toLowerCase().includes("inapplicable")) {
          stop = true;
          end_time_applicable = new Date().getTime();
          obj = {
            result: "inapplicable",
            concreteHTML: aplicable,
            expected: element.expected,
            time_applicable: end_time_applicable - start_time_applicable,
            inaplicable_rule: key,
          };
          break;
        }
      }
      end_time_applicable = new Date().getTime();
      if (!stop) {
        obj = {};
        obj["time_applicable"] = end_time_applicable - start_time_applicable;
        for (j in criterias) {
          k = criterias[j];
          question = message2(testType, html, k);
          start_time_result = new Date().getTime();
          result = await LLM.callLLM(question, chain);
          end_time_result = new Date().getTime();
          if (result.toLowerCase().includes("passed")) {
            concreteResult = "passed";
          } else {
            concreteResult = "failed";
          }
          obj[k] = {
            result: concreteResult,
            concreteHTML: result,
            expected: element.expected,
            time_result: end_time_result - start_time_result,
          };
        }
      }
      final[element.ruleId][element.testcaseId] = obj;
      console.log(testType + ": finished test " + cont + " of " + allTests);
      cont++;
    }
  } catch (error) {
    console.log(error);
    return [final, current_test];
  }
  console.log("=====================================");
  console.log("             TERMINADO");
  console.log("=====================================");
  return [final, undefined];
};

resultFromJson2 = async (testType, testsJson, model) => {
  chain = await LLM.initialize(model);
  final = {};
  for (i in testsJson) {
    actRule = testsJson[i];
    tests = {};
    for (tc in actRule) {
      rules = Object.keys(actRule[tc].ruleAccessibilityRequirements);
      html = htmlDir + actRule[tc].url + ".html";
      html = fs.readFileSync(html, "utf8");
      conversationChainAplicable = message1(testType, html, rules[0]);
      start_time_applicable = new Date().getTime();
      aplicable = await LLM.callLLM(conversationChainAplicable, chain);
      conversationChainAplicable =
        conversationChainAplicable + "AI:\n" + aplicable + "\n";
      stop = false;
      if (aplicable.toLowerCase().includes("inapplicable")) {
        stop = true;
        end_time_applicable = new Date().getTime();
        aplicable = aplicable.substring(6);
        obj = {
          result: "inapplicable",
          concreteHTML: aplicable,
          expected: actRule[tc].expected,
          time_applicable: end_time_applicable - start_time_applicable + "ms",
          inaplicable_rule: rules[0],
        };
      } else {
        k = 1;
        while (k < rules.length) {
          conversationChainAplicable =
            conversationChainAplicable + continue1(testType, rules[k]);
          aplicable = await LLM.callLLM(conversationChainAplicable, chain);
          conversationChainAplicable =
            conversationChainAplicable + "AI:\n" + aplicable + "\n";
          if (aplicable.toLowerCase().includes("inapplicable")) {
            stop = true;
            end_time_applicable = new Date().getTime();
            aplicable = aplicable.substring(6);
            obj = {
              result: "inapplicable",
              concreteHTML: aplicable,
              expected: actRule[tc].expected,
              time_applicable:
                end_time_applicable - start_time_applicable + "ms",
              inaplicable_rule: rules[k],
            };
            break;
          } else {
            k++;
          }
        }
        end_time_applicable = new Date().getTime();
      }
      if (!stop) {
        obj = {};
        obj["time_applicable"] =
          end_time_applicable - start_time_applicable + "ms";
        for (k in rules) {
          question = message2(testType, html, rules[k]);
          start_time_result = new Date().getTime();
          result = await LLM.callLLM(question, chain);
          end_time_result = new Date().getTime();
          obj[rules[k]] = {
            result: result.substring(0, 6),
            concreteHTML: result.substring(6),
            expected: actRule[tc].expected,
            time_result: end_time_result - start_time_result + "ms",
          };
        }
      }
      n = "test" + tc;
      tests[n] = obj;
      console.log("finished test " + tc + " of " + Object.keys(actRule).length);
    }
    final[i] = tests;
    console.log("finished rule " + i + " of " + Object.keys(testsJson).length);
  }
  console.log("=====================================");
  console.log("             TERMINADO");
  console.log("=====================================");
  return final;
};

resultFromJson = async (testType, testsJson, model) => {
  return await doTest(testType, testsJson, model, {}, 1);
};

continueResultFromJson = async (
  testType,
  testsJson,
  model,
  results,
  lastTest
) => {
  console.log(lastTest);
  testcaseIDs = testsJson.testcases.map(
    (tc) => tc.ruleId + "_" + tc.testcaseId
  );
  let cont = testcaseIDs.indexOf(lastTest);
  console.log("continuing from test " + cont);
  let final = results;

  console.log(
    testsJson.testcases[cont].ruleId +
      "_" +
      testsJson.testcases[cont].testcaseId
  );

  return await doTest(testType, testsJson, model, final, cont);
};

doTest = async (testType, testsJson, model, final, cont) => {
  let chain = await LLM.initialize(model);
  let current_test = "";
  let allTests = testsJson.testcases.length;

  maxRetries = 2;
  retries = 0;
  let applicable;
  let result;

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  while (cont <= allTests) {
    try {
      for (let tc = cont - 1; tc < allTests; tc++) {
        let element = testsJson.testcases[tc];
        if (!final[element.ruleId]) {
          final[element.ruleId] = {};
        }

        current_test = element.ruleId + "_" + element.testcaseId;
        let html = htmlDir + current_test + ".html";
        html = fs.readFileSync(html, "utf8");
        let stop = false;
        let criterias = Object.keys(element.ruleAccessibilityRequirements);
        let start_time_applicable;
        for (let i in criterias) {
          let key = criterias[i];
          start_time_applicable = new Date().getTime();
          if (testType.includes("Tech")) {
            applicable = await techniquesQ(
              "Applicable",
              html,
              key,
              chain,
              model.llm
            );
          } else {
            let questionAplicable = message1(testType, html, key);
            applicable = await LLM.callLLM(questionAplicable, chain, model.llm);
            applicable = manageResponse(applicable);
          }
          //console.log(applicable.result);
          if (applicable.result.toLowerCase() === "inapplicable") {
            stop = true;
            let end_time_applicable = new Date().getTime();
            final[element.ruleId][element.testcaseId] = {
              result: "inapplicable",
              concreteHTML: applicable.description,
              expected: element.expected,
              time_applicable: end_time_applicable - start_time_applicable,
              inapplicable_rule: key,
            };
            break;
          }
        }

        let end_time_applicable = new Date().getTime();

        if (!stop) {
          let obj = {};
          obj["time_applicable"] = end_time_applicable - start_time_applicable;
          for (let j in criterias) {
            let k = criterias[j];
            let start_time_result = new Date().getTime();
            if (testType.includes("Tech")) {
              result = await techniquesQ("Result", html, k, chain, model.llm);
            } else {
              let question = message2(testType, html, k);
              result = await LLM.callLLM(question, chain, model.llm);
              result = manageResponse(result);
            }
            let end_time_result = new Date().getTime();
            let concreteResult =
              result.result.toLowerCase() === "passed" ||
              result.result.toLowerCase() === "passes"
                ? "passed"
                : "failed";

            obj[k] = {
              result: concreteResult,
              concreteHTML: result.description,
              expected: element.expected,
              time_result: end_time_result - start_time_result,
            };
          }
          final[element.ruleId][element.testcaseId] = obj;
        }

        console.log(testType + ": finished test " + cont + " of " + allTests);
        cont++;
      }

      break; // If all tests pass without error, exit the loop
    } catch (error) {
      console.log("Error occurred in test: " + current_test);
      console.log(error);
      console.log("Waiting 30 minutes before retrying...");
      /* if (retries < maxRetries) {
        retries++;
        //wait 1 hour before retrying
        await wait(40 * 60 * 1000);
        console.log("Retrying test: " + current_test);
        retrieTime = new Date();
        console.log("At " + retrieTime);
      } else {
        console.log("Max retries reached. Exiting...");
        return [final, current_test];
      } */
      if (error.message.includes("split")) {
        console.log("Error in split, retrying...");
      } else {
        return [final, current_test];
      }
    }
  }

  console.log("=====================================");
  console.log("             TERMINADO");
  console.log("=====================================");

  return [final, undefined];
};

module.exports = {
  resultFromJson,
  continueResultFromJson,
};
