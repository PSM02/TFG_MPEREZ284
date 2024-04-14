var express = require('express');
var router = express.Router();
const model = require("../src/llm");
const testsJson = require('../test/Tests.json');
const axios = require('axios');
const methods = require('../src/methods');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.send('Hello World!');
});

router.get('/testRulesWithNothing', async function (req, res, next) {
  try {
    allTests = []
    length = Object.keys(testsJson).length
    count = 0    
    for (rule in testsJson) {
      count++
      testRes = []
      for (tc in testsJson[rule].tests) {
        ruleID = rule.split(":")[1]
        url = testsJson[rule].tests[tc].url
        const html = await axios.get(url);
        question = "Given this html:\n"
          + html.data
          + "\nTell me if wcag rule " + ruleID + " is aplicable to the html, JUST SAY APPLICABLE OR INAPPLICABLE\n"
        aplicable = await model.invoke(question)
        answer = ""
        if (aplicable === "Inapplicable" || aplicable === "INAPPLICABLE") {
          answer = "Inapplicable"
        } else {
          question = "Given this html:\n"
            + html.data
            + "\nTell me if it passes wcag rule " + ruleID + ", JUST ANSWER PASSED OR FAILED\n"
          answer = await model.invoke(question)
        }
        obj = {
          "html": html.data,
          "num": tc,
          "expected": testsJson[rule].tests[tc].expected,
          "response": answer
        }
        testRes[tc] = obj
      }
      percentage = methods.calculateScores(testRes)
      result = {
        "rule": rule,
        "res": testRes,
        "percentage": percentage
      }
      allTests.push(result)
      console.log(count + " of " + length)
    }
    res.render('allRules', { res: allTests })
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get('/312wExamples', async function (req, res, next) {
  try {
    p = []
    test312 = testsJson["wcag20:3.1.2"]
    for (tc in test312.tests) {
      url = test312.tests[tc].url
      const html = await axios.get(url);
      examples = test312.tests.filter((t) => t.url !== url)
      question = "Given this html:\n"
        + html.data
        + "\nDo the following, DONT EXPLAIN HOW ITS DONE, JUST SAY APPLICABLE OR INAPPLICABLE:\n"
        + "Tell me if wcag rule 3.1.2 is aplicable to the html\n"
        + 'As examples, here you some other test urls followed by their corresponding answer, "failed" and "passed" mean it is aplicable, "inaplicable" means it is not:\n'
        + "<EXAMPLES>\n"
        + examples.map((t) => t.url + " " + t.expected).join("\n")
        + "</EXAMPLES>"
      aplicable = await model.invoke(question)
      answer = ""
      if (aplicable === "Inapplicable") {
        answer = "Inapplicable"
      } else {
        question = + "<WHAT TO DO>\n"
          + "1) Extract all the text in the HTML\n"
          + "2) Detect the language of the extracted text\n"
          + "3) Check if the language represented by the lang attribute (example: en/English, fr/French, etc.) of the corresponding element matches the language of the text. Specify the element\n"
          + "</WHAT TO DO>\n"
          + "<EXAMPLES>\n"
          + '<EXAMPLE_1>\n'
          + 'HTML: <html lang="es"><body><article lang="english"><p aria-hidden="true">They wandered into a strange Tiki bar on the edge of the small beach town.</p></article></body></html>\n'
          + 'Extracted text: They wandered into a strange Tiki bar on the edge of the small beach town.\n'
          + 'Detected language: en\n'
          + 'Element: article, lang: english\n'
          + 'ANSWER: FAILED, not valid value for lang attribute\n'
          + '</EXAMPLE_1>\n'
          + '<EXAMPLE_2>\n'
          + 'HTML: <html lang="fr"><body><p lang="en-US-GB">They wandered into a strange Tiki bar on the edge of the small beach town.</p></body></html>\n'
          + 'Extracted text: They wandered into a strange Tiki bar on the edge of the small beach town.\n'
          + 'Detected language: en\n'
          + 'Element: p, lang: en-US-GB\n'
          + 'ANSWER: PASSED, valid lang value and maching languages\n'
          + '</EXAMPLE_2>\n'
          + "<EXAMPLES>\n"
          + "Given this html, repeat what the examples do:\n"
          + html.data

        answer = await model.invoke(question)
      }
      obj = {
        "html": html.data,
        "num": tc,
        "expected": test312.tests[tc].expected,
        "response": answer
      }
      p[tc] = obj
      console.log(tc)
    }
    percentage = methods.calculateScores(p)
    res.render('rule312', { res: p, percentage: percentage })
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get('/312wContext', async function (req, res, next) {
  try {
    p = []
    test312 = testsJson["wcag20:3.1.2"]
    context = test312.rulePage
    for (tc in test312.tests) {
      url = test312.tests[tc].url
      const html = await axios.get(url);
      examples = test312.tests.filter((t) => t.url !== url)
      question = "<context>"
        + "all the information in this link: " + context
        + "</context>"
        + "Given this html:\n"
        + html.data
        + "\nDo the following, DONT EXPLAIN HOW ITS DONE, JUST SAY APLICABLE OR INAPLICABLE:\n"
        + "Tell me if wcag rule 3.1.2 is aplicable to the html\n"
        + "also, here you some other test urls followed by their corresponding, 'failed' and 'passed' mean it is aplicable, 'inaplicable' means it is not:\n"
        + "<EXAMPLES>\n"
        + examples.map((t) => t.url + " " + t.expected).join("\n")
        + "</EXAMPLES>"

      aplicable = await model.invoke(question)
      answer = ""
      if (aplicable === "Inapplicable") {
        answer = "Inapplicable"
      } else {
        question = "<context>"
          + "all the information in this link: " + context
          + "</context>"
          + "Given this html, SAY IF IT PASSES THE RULE, IF YES THEN PASSED ELSE FAILED:\n"
          + html.data
          + "also, here you some other test urls followed by their corresponding answer, 'failed' and 'passed'\n"
          + "<EXAMPLES>\n"
          + examples.map((t) => t.url + " " + t.expected).join("\n")
          + "</EXAMPLES>"

        answer = await model.invoke(question)
      }
      obj = {
        "html": html.data,
        "num": tc,
        "expected": test312.tests[tc].expected,
        "response": answer
      }
      p[tc] = obj
      console.log(tc)
    }
    percentage = methods.calculateScores(p)
    res.render('rule312', { res: p, percentage: percentage })
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
