var express = require('express');
var router = express.Router();
model = require("../src/llm");
const testsJson = require('../test/newTest.json');
const testsJson311 = require('../test/311.json');
const axios = require('axios');
methods = require('../src/methods');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.send('Hello World!');
});

router.get('/pruebaLLM', async function (req, res, next) {
  try {
    question = "<context>" +
               "all the information in this link: https://www.w3.org/WAI/WCAG22/Understanding/captions-prerecorded.html" +
               "</context>" +
               "What is the benefit"
    const response = await model.invoke(question)
    res.render('duck', { response: response });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get('/312NoContext', async function (req, res, next) {
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
        +"1) Extract all the text in the HTML\n" 
        +"2) Detect the language of the extracted text\n" 
        +"3) Check if the language represented by the lang attribute (example: en/English, fr/French, etc.) of the corresponding element matches the language of the text. Specify the element\n"
        +"</WHAT TO DO>\n"
        +"<EXAMPLES>\n"
        +'<EXAMPLE_1>\n'
        +'HTML: <html lang="es"><body><article lang="english"><p aria-hidden="true">They wandered into a strange Tiki bar on the edge of the small beach town.</p></article></body></html>\n'
        +'Extracted text: They wandered into a strange Tiki bar on the edge of the small beach town.\n'
        +'Detected language: en\n'
        +'Element: article, lang: english\n'
        +'ANSWER: FAILED, not valid value for lang attribute\n'
        +'</EXAMPLE_1>\n'
        +'<EXAMPLE_2>\n'
        +'HTML: <html lang="fr"><body><p lang="en-US-GB">They wandered into a strange Tiki bar on the edge of the small beach town.</p></body></html>\n'
        +'Extracted text: They wandered into a strange Tiki bar on the edge of the small beach town.\n'
        +'Detected language: en\n'
        +'Element: p, lang: en-US-GB\n'
        +'ANSWER: PASSED, valid lang value and maching languages\n'
        +'</EXAMPLE_2>\n'
        +"<EXAMPLES>\n"
        +"Given this html, repeat what the examples do:\n"
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
    percentage = methods.calculatePercentage(p)
    res.render('rule312', { res : p, percentage: percentage })
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
                +"Given this html:\n"
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
    percentage = methods.calculatePercentage(p)
    res.render('rule312', { res : p, percentage: percentage })
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get('/311', async function (req, res, next) {
  try {
    p = []
    for (tc in testsJson311.testcases) {
      url = testsJson311.testcases[tc].url
      const html = await axios.get(url)
      question = "Given this html:\n"
                +html.data+
                "\nDo the following, DONT EXPLAIN HOW ITS DONE, JUST GIVE ME THE ANSWER:\n"
                +"1) See if the html element has a lang attribute, specify it\n"
                + "DONT EXPLAIN HOW ITS DONE, JUST GIVE ME THE ANSWER:\n"
                +"2) If it does, specify it and remember it as LANG_HTML\n"
                +"3) ALSO DETECT IF ITS A VALID VALUE FOR A LANGUAGE\n"
                + "DONT EXPLAIN HOW ITS DONE, JUST GIVE ME THE ANSWER:\n"
                +"4) If that is fulfilled, then get all the lang attributes of the rest of the code\n"
                + "DONT EXPLAIN HOW ITS DONE, JUST GIVE ME THE ANSWER:\n"
                +"5) If there are others check if their lang attributes are valid values and if they match values with LANG_HTML\n"
                + "DONT EXPLAIN HOW ITS DONE, JUST GIVE ME THE ANSWER:"
                +"6) Based on the answers, tell me FAILED or PASSED\n"
      obj = {
        "html": html.data,
        "num": tc,
        "expected": testsJson311.testcases[tc].expected,
        "response": await model.invoke(question)
      }
      p[tc] = obj
      console.log(tc)
    }
    res.render('rule312', { res : p });
/*  const html = await axios.get("https://www.w3.org/WAI/content-assets/wcag-act-rules/testcases/de46e4/a746b387d13dc61266d1fcde19b91b89441b1be7.html")
    question = "Given this html:\n"
                + html.data
                + "\nDo the following:\n"
                + "1. Extract all the texts from the following HTML and tell me in what language they are in\n"
                + "2. See if the language maches the lang element of their parent HTML nodes, ANSWER TRUE OR FALSE ONLY\n"
    obj = {
      "html": html.data,
      "expected": testsJson311.testcases[0].expected,
      "response": await model.invoke(question)
    }
    res.send(obj); */
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
