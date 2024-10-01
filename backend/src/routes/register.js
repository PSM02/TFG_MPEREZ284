const express = require("express");
const db = require("../methods/mongodb");

const router = express.Router();

register = async (req, res) => {
  db.users.insert({ ...req.body, testsPerformed: 0 }, function (err, doc) {
    if (err) {
      res.status(400).send({ message: err });
    } else {
      res.status(200).send({ message: "User was registered successfully!" });
    }
  });
};

checkDuplicateUsernameOrEmail = async (req, res, next) => {
  db.users.findOne({ username: req.body.username }, function (err, doc) {
    if (doc) {
      return res.status(400).send({ message: "Username is already in use!" });
    } else {
      db.users.findOne({ email: req.body.email }, function (err, doc) {
        if (doc) {
          return res.status(400).send({ message: "Email is already in use!" });
        } else {
          next();
        }
      });
    }
  });
};

router.post("/", checkDuplicateUsernameOrEmail, register);

router.get("/", (req, res) => {
  res.send("Register");
});

module.exports = router;
