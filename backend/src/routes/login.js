const express = require("express");
const db = require("../methods/mongodb");

const router = express.Router();

login = async (req, res) => {
  db.users.findOne(
    { username: req.body.username, password: req.body.password },
    function (err, doc) {
      if (doc) {
        res.status(200).send({ message: "Login successful!" });
      } else {
        res.status(400).send({ message: "Login failed!" });
      }
    }
  );
};

router.post("/", (req, res) => {
  console.log(req.body);
  login(req, res);
});

router.get("/", (req, res) => {
  res.send("Login");
});

module.exports = router;
