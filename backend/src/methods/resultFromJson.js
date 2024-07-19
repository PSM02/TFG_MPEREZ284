const groq = require("./groq");
const fs = require("fs");

const groqLLM = groq.llm;
const htmlDir = "data/htmls/";
const ruleDescs = require("../../data/rule_descs.json");
const ruleUnderstandings = require("../../data/rule_understandings.json");

informationProvided1 = (testType, info) => {
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
  }
};

informationProvided2 = (testType, info) => {
  if (testType == "testsWithNothing") {
    return "";
  } else if (testType == "testsWithWcagDescription") {
    return "<RULE DESCRIPTION>\n" + info.ruleDesc + "</RULE DESCRIPTION>\n";
  } else if (testType == "testsWithUnderstanding") {
    return (
      "<RULE DESCRIPTION>\n" +
      info.ruleDesc +
      "</RULE DESCRIPTION>\n" +
      "<RULE UNDERSTANDING>\n" +
      present_understanding(info.ruleUnderstanding) +
      "</RULE UNDERSTANDING>\n"
    );
  }
};

message1 = (testType, html, rule) => {
  conversationChainAplicable =
    "HUMAN:\n" +
    "just say APPLICABLE or INAPPLICABLE\n" +
    "<INFORMATION PROVIDED>\n" +
    informationProvided1(testType, {
      html: html,
      ruleDesc: ruleDescs[rule.split(":")[1]].text,
      ruleUnderstanding:
        ruleUnderstandings[rule.split("20").join("")].understanding,
    }) +
    "</INFORMATION PROVIDED>\n" +
    "</RULE DESCRIPTION>\n" +
    "</INFORMATION PROVIDED>\n" +
    "<WHAT TO DO>\n" +
    "Tell me if wcag rule" +
    rules +
    " is aplicable to the html\n" +
    "</WHAT TO DO>\n" +
    "<HOW TO ANSWER>\n" +
    "just say APPLICABLE or INAPPLICABLE, if INAPPLICABLE where is not aplicable\n" +
    "DONT GIVE ANY OTHER INFORMATION\n" +
    "</HOW TO ANSWER>\n";
  return conversationChainAplicable;
};

continue1 = (testType, rule) => {
  conversationChainAplicable =
    "HUMAN:\n" +
    "Now Tell me if wcag rule" +
    rule +
    informationProvided2(testType, {
      ruleDesc: ruleDescs[rule.split(":")[1]].text,
      ruleUnderstanding:
        ruleUnderstandings[rule.split("20").join("")].understanding,
    }) +
    " is aplicable to the html the same way you did before\n" +
    "JUST SAY APPLICABLE OR INAPPLICABLE\n";
  return conversationChainAplicable;
};

message2 = (testType, html, rule) => {
  conversationChainResult =
    "HUMAN:\n" +
    "just say PASSED OR FAILED and ALWAYS the HTML that made you decide\n" +
    "<INFORMATION PROVIDED>\n" +
    informationProvided1(testType, {
      html: html,
      ruleDesc: ruleDescs[rule.split(":")[1]].text,
      ruleUnderstanding:
        ruleUnderstandings[rule.split("20").join("")].understanding,
    }) +
    "</INFORMATION PROVIDED>\n" +
    "<WHAT TO DO>\n" +
    "Tell me if the html PASSES or FAILS rule" +
    rule +
    "\n" +
    "</WHAT TO DO>\n" +
    "<HOW TO ANSWER>\n" +
    "just say PASSED OR FAILED and ALWAYS the HTML that made you decide\n" +
    "DONT GIVE ANY OTHER INFORMATION\n" +
    "</HOW TO ANSWER>\n";
  return conversationChainResult;
};

/* continue2 = (testType, rule) => {
  conversationChainResult =
    "HUMAN:\n" +
    "Now tell me if it PASSES or FAILS wcag rule" +
    rule +
    informationProvided2(testType, {
      ruleDesc: ruleDescs[rule.split(":")[1]].text,
      ruleUnderstanding:
        ruleUnderstandings[rule.split("20").join("")].understanding,
    }) +
    "the same way you did before\n" +
    "JUST SAY PASSED OR FAILED\n";
  return conversationChainResult;
}; */

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

resultFromJson = async (testType, testsJson) => {
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
      aplicable = await groq.callLLM(conversationChainAplicable);
      console.log(aplicable.content);
      conversationChainAplicable =
        conversationChainAplicable + "AI:\n" + aplicable.content + "\n";
      stop = false;
      if (aplicable.content.toLowerCase().includes("inapplicable")) {
        stop = true;
        end_time_applicable = new Date().getTime();
        aplicable = aplicable.content.split("\n")[1];
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
          aplicable = await groq.callLLM(conversationChainAplicable);
          console.log(aplicable.content);
          conversationChainAplicable =
            conversationChainAplicable + "AI:\n" + aplicable.content + "\n";
          if (aplicable.content.toLowerCase().includes("inapplicable")) {
            stop = true;
            end_time_applicable = new Date().getTime();
            aplicable = aplicable.content.split("\n")[1];
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
          result = await groq.callLLM(question);
          result = result.content.split("\n");
          end_time_result = new Date().getTime();
          obj[rules[k]] = {
            result: result[0],
            concreteHTML: result[1],
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
  /* fs.writeFileSync(
    "data/test_int/" + testType + "/" + groqLLM + ".json",
    JSON.stringify(final, null, 4)
  ); */
  console.log("=====================================");
  console.log("             TERMINADO");
  console.log("=====================================");
  return final;
};

module.exports = resultFromJson;
