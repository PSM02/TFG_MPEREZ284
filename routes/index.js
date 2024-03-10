var express = require('express');
var router = express.Router();
model = require("../src/llm");
const testsJson312 = require('../test/312.json');
const testsJson311 = require('../test/311.json');
const axios = require('axios');
const cheerio = require('cheerio');


const fetchAndCleanHtml = async (url) => {
  const { data: html } = await axios.get(url);
  const $ = cheerio.load(html);
  $('script').remove();
  return $.html();
};

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
      const html = await fetchAndCleanHtml(url);
      question =  + "<WHAT TO DO>\n"
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
                  + html

      obj = {
        "html": html,
        "num": tc,
        "expected": testsJson312.testcases[tc].expected,
        "response": await model.invoke(question)
      }
      p[tc] = obj
      console.log(tc)
    }
    res.render('rule312', { res : p })
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
