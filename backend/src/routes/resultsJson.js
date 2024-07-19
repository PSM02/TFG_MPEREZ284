const express = require("express");

const router = express.Router();

const resultFromJson = require("../methods/resultFromJson");

router.post("/", async (req, res) => {
  //const { testType, html, rule } = req.body;
  const result = await resultFromJson("testsWithNothing", req.body.json);
  res.send(result);
});

module.exports = router;
