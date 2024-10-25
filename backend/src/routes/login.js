const express = require("express");
const db = require("../methods/mongodb");

const router = express.Router();

router.post("/", (req, res) => {
  console.log(req.body);
  userName = req.body.username;
  password = req.body.password;
  if (userName == "" || password == "") {
    res.status(400).send({ message: "Please enter username and password!" });
  } else {
    db.users.findOne(
      { username: userName, password: password },
      function (err, doc) {
        if (doc) {
          res.status(200).send({ message: "Login successful!" });
        } else {
          res.status(400).send({ message: "Wrong username or password" });
        }
      }
    );
  }
});

router.get("/", (req, res) => {
  res.send("Login");
});

module.exports = router;
