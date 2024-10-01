const fs = require("fs");
const LLM = require("./callLLM");

const htmlDir = "data/htmls/";
const sc_info = require("../../data/SC_info.json");
const originalTests = require("../../data/test/original_test_justAA.json");

informationProvided1 = (testType, info) => {
  returnInfo = "<HTML>\n" + info.html + "\n</HTML>\n";
  if (testType.includes("Desc")) {
    returnInfo +=
      "<RULE DESCRIPTION>\n" + info.ruleDesc + "</RULE DESCRIPTION>\n";
  }
  if (testType.includes("Undr")) {
    returnInfo +=
      "<RULE UNDERSTANDING>\n" +
      present_understanding(info.ruleUnderstanding) +
      "</RULE UNDERSTANDING>\n";
  }
  if (testType.includes("Tech")) {
    returnInfo +=
      "<RULE TECHNIQUES>\n" +
      present_techniques(info.techniques) +
      "</RULE TECHNIQUES>\n";
  }
  return returnInfo;
};

message1 = (testType, html, rule) => {
  const { techniques, ...understanding } = sc_info[rule].understanding;
  conversationChainAplicable =
    "<INFORMATION PROVIDED>\n" +
    informationProvided1(testType, {
      html: html,
      ruleDesc: sc_info[rule].description,
      ruleUnderstanding: understanding,
      techniques: sc_info[rule].understanding.techniques,
    }) +
    "</INFORMATION PROVIDED>\n" +
    "You are a helpful assistant that just, with the given information, says if the wcag rule: " +
    rule +
    " is applicable or inapplicable to the html and provides the html that make them decide\n";
  return conversationChainAplicable;
};

message2 = (testType, html, rule) => {
  const { techniques, ...understanding } = sc_info[rule].understanding;
  conversationChainResult =
    "<INFORMATION PROVIDED>\n" +
    informationProvided1(testType, {
      html: html,
      ruleDesc: sc_info[rule].description,
      ruleUnderstanding: understanding,
      techniques: sc_info[rule].understanding.techniques,
    }) +
    "</INFORMATION PROVIDED>\n" +
    "You are a helpful assistant that just, with the given information, says if the html has passed or failed wcag rule: " +
    rule +
    "and provides the html portion that makes it pass or fail\n";
  return conversationChainResult;
};

present_understanding = (understanding) => {
  return (
    "INTENT: " +
    understanding.intent +
    "\n" +
    "EXAMPLES: " +
    understanding.examples +
    "\n" +
    "TEST-RULES: " +
    understanding["test-rules"] +
    "\n"
  );
};

present_techniques = (techniques) => {
  return "TECHNIQUES: " + "\n" + techniques.join("\n") + "\n";
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
  testcaseIDs = originalTests.testcases.map((tc) => tc.testcaseId);
  let cont = testcaseIDs.indexOf(lastTest.split("_")[1]);
  let final = results;

  return await doTest(testType, testsJson, model, JSON.parse(final), cont);
};

doTest = async (testType, testsJson, model, final, cont) => {
  let chain = await LLM.initialize(model);
  testsJson = originalTests;
  let current_test = "";
  let allTests = testsJson.testcases.length;

  //const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
          let questionAplicable = message1(testType, html, key);
          start_time_applicable = new Date().getTime();
          let aplicable = await LLM.callLLM(questionAplicable, chain);
          if (aplicable.toLowerCase().includes("inapplicable")) {
            stop = true;
            let end_time_applicable = new Date().getTime();
            final[element.ruleId][element.testcaseId] = {
              result: "inapplicable",
              concreteHTML: aplicable,
              expected: element.expected,
              time_applicable: end_time_applicable - start_time_applicable,
              inaplicable_rule: key,
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
            let question = message2(testType, html, k);
            let start_time_result = new Date().getTime();
            let result = await LLM.callLLM(question, chain);
            let end_time_result = new Date().getTime();

            let concreteResult = result.toLowerCase().includes("passed")
              ? "passed"
              : "failed";

            obj[k] = {
              result: concreteResult,
              concreteHTML: result,
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
      console.log("Waiting 10 minutes before retrying...");

      /* // Wait for 10 minutes before retrying
      await wait(3 * 60 * 1000);
      console.log("Retrying from test: " + current_test); */
      return [final, current_test];
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
