const express = require("express");
const db = require("../methods/mongodb");
const router = express.Router();

register = async (req, res) => {
  db.users.insert(
    { ...req.body, testsPerformed: 0, ownModels: {} },
    function (err, doc) {
      if (err) {
        res.status(400).send({ message: err });
      } else {
        res.status(200).send({ message: "User was registered successfully" });
      }
    }
  );
};
checkDuplicateUsernameOrEmail = async (req, res, next) => {
  db.users.findOne({ username: req.body.username }, function (err, doc) {
    if (doc) {
      return res.status(400).send({ message: "Username is already in use" });
    } else {
      db.users.findOne({ email: req.body.email }, function (err, doc) {
        if (doc) {
          return res.status(400).send({ message: "Email is already in use" });
        } else {
          next();
        }
      });
    }
  });
};
correctData = async (req, res, next) => {
  errors = [];
  if (req.body.name == "") {
    errors.push("Name is empty");
  }
  if (req.body.surname == "") {
    errors.push("Surname is empty");
  }
  if (req.body.username == "") {
    errors.push("Username is empty");
  }
  if (req.body.email == "") {
    errors.push("Email is empty");
  }
  if (req.body.password == "") {
    errors.push("Password is empty");
  }
  if (req.body.date_of_birth == "") {
    errors.push("Date of birth is empty");
  }
  if (errors.length > 0) {
    return res.status(400).send({ message: errors });
  } else {
    next();
  }
};

router.post("/", correctData, checkDuplicateUsernameOrEmail, register);

router.get("/", (req, res) => {
  res.send("Register");
});

module.exports = router;
