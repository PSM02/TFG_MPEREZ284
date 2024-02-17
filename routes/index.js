var express = require('express');
var router = express.Router();
model = require("../src/llm");
const testsJson312 = require('../test/312.json');
const testsJson311 = require('../test/311.json');
const axios = require('axios');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.send('Hello World!');
});

router.get('/pruebaLLM', async function (req, res, next) {
  try {
    const response = await model.invoke("What is a duck")
    res.render('duck', { response: response });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get('/312', async function (req, res, next) {
  try {
    p = []
    for (tc in testsJson312.testcases) {
      url = testsJson312.testcases[tc].url
      const html = await axios.get(url)
      /* question = "Given this html:\n"
                + html.data
                + "\nDo the following:\n"
                + "1) Extract all the text in the HTML\n"
                + "2) Detect the language of each extracted text (without looking the html), specify the language."
                + "3) Then tell what value a lang attribute of an html element should have to match it (without looking the html), we will call this LANG_TEXT\n"
                + "4) Fro each text find the corresponding HTML element. Specify the corresponding element"
                + "5) Check if the lang attribute of the corresponding element (we will call it LANG_ELEM) and the lang attribute we got before (LANG_TEXT) represent the same language (example: fr and fr-CH represent the same language, French).\n"
                + "6) If the answer is no, look if the parent or child nodes have a lang and see if it matches. Specify the node\n"
                + "depending on the last two questions and their answers, say TRUE or FALSE\n" */
      question = "Given this html:\n"
      + html.data
      + "\n 1) Extract all the text in the HTML \n"
      + "2) Check the language of each extracted text \n"
      + "3) Check whether the language of each text matches the language defined in its corresponding HTML node. Specify TRUE or FALSE "
      obj = {
        "html": html.data,
        "num": tc,
        "expected": testsJson312.testcases[tc].expected,
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
      "expected": testsJson312.testcases[0].expected,
      "response": await model.invoke(question)
    }
    res.send(obj); */
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
