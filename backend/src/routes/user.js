const express = require("express");
const db = require("../methods/mongodb");

const router = express.Router();

router.post("/getUserInfo", (req, res) => {
  db.users.findOne({ username: req.body.user }, function (err, doc) {
    if (doc) {
      return res.status(200).send(doc);
    } else {
      return res.status(400).send({ message: "User not found!" });
    }
  });
});

router.post("/addOwnModel", (req, res) => {
  user = req.body.user;
  model = req.body.model;
  if (model.model === "" || model.llm === "" || model.api_key === "") {
    return res.status(400).send({ message: "Please fill all fields!" });
  } else {
    db.users.find({ username: user }, function (err, doc) {
      if (err) {
        console.error(err);
      } else {
        //look if model already exists
        if (!doc[0].ownModels[model.model]) {
          newOwnModels = doc[0].ownModels;
          newOwnModels[model.model] = {
            llm: model.llm,
            api_key: model.api_key,
          };
          db.users.update(
            { _id: doc[0]._id },
            { $set: { ownModels: newOwnModels } },
            function (err) {
              if (err) {
                console.error(err);
              }
            }
          );
        }
      }
    });
    return res.status(200).send({ message: "Model and API-key submitted" });
  }
});

module.exports = router;
