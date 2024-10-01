const express = require("express");
const db = require("../methods/mongodb");
const router = express.Router();

const jsonTesting = require("../methods/resultFromJson");
const testWegPage = require("../methods/testWegPage");

// Priority queue array
let requestQueue = [];
let activeProcesses = 0;
const maxConcurrent = 5; // Maximum number of concurrent operations

const formatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Madrid", // specify Spain's time zone
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: false, // use 24-hour format
});

async function getID(user) {
  return new Promise((resolve, reject) => {
    db.users.find({ username: user }, function (err, doc) {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve(doc[0].username + doc[0].testsPerformed);
      }
    });
  });
}

async function updateTestPerformed(user) {
  return new Promise((resolve, reject) => {
    db.users.find({ username: user }, function (err, doc) {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        db.users.update(
          { _id: doc[0]._id },
          { $set: { testsPerformed: doc[0].testsPerformed + 1 } },
          function (err) {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              resolve();
            }
          }
        );
      }
    });
  });
}

async function addNewTest(user, code, testType, testSubject, model, infProv) {
  // Construct the base object
  const newTest = {
    user: user,
    status: "waiting",
    code: code,
    type: testType,
    testSubject: JSON.stringify(testSubject),
    model: model,
  };

  // Conditionally add informationProvided if it is defined
  if (infProv !== undefined) {
    newTest.informationProvided = infProv;
  }

  // Perform the database insertion
  db.ResultJsons.insert(newTest, function (err) {
    if (err) {
      console.error(err);
    }
  });

  // Update test performed
  updateTestPerformed(user);
}

async function changeState(code, state) {
  db.ResultJsons.find({ code: code }, function (err, doc) {
    if (err) {
      console.error(err);
    } else {
      db.ResultJsons.update(
        { _id: doc[0]._id },
        { $set: { status: state } },
        function (err) {
          if (err) {
            console.error(err);
          }
        }
      );
    }
  });
}

async function putOnContinue(code) {
  await changeState(code, "waitingContinue");
}

async function putOnRepeat(code) {
  await changeState(code, "waitingRepeat");
}

async function startRepeating(code) {
  await changeState(code, "repeating");
}

async function continueTest(code) {
  await changeState(code, "continuing");
}

async function processQueue() {
  if (requestQueue.length === 0) return;

  while (activeProcesses < maxConcurrent && requestQueue.length > 0) {
    requestQueue.sort((a, b) => a.priority - b.priority);
    let {
      user,
      testSubject,
      model,
      code,
      testType,
      repeating,
      continuing,
      infProv,
      resolve,
      reject,
    } = requestQueue.shift();
    try {
      // Increment the count of active processes
      activeProcesses++;
      const result = await handleTestRequest(
        user,
        testSubject,
        model,
        code,
        testType,
        repeating,
        continuing,
        infProv
      );
      resolve(result); // Resolve the promise with the result
    } catch (error) {
      reject(error); // Reject the promise if there's an error
    } finally {
      activeProcesses--;
      if (requestQueue.length > 0) {
        processQueue(); // Process the next request in the queue
      }
    }
  }
}

async function startTest(code) {
  db.ResultJsons.find({ code: code }, function (err, doc) {
    if (err) {
      console.error(err);
    } else if (doc.length > 0) {
      db.ResultJsons.update(
        { _id: doc[0]._id },
        { $set: { status: "started" } },
        function (err) {
          if (err) {
            console.error(err);
          }
        }
      );
    }
  });
}

async function jsonTest(json, model, infProv, continuing) {
  results = {};
  info = "";
  if (infProv.includes("All")) {
    try {
      [results_wD, final_test_wD] = await jsonTesting.resultFromJson(
        "Desc",
        json,
        model
      );
      results["wD"] = results_wD;
      [results_wU, final_test_wU] = await jsonTesting.resultFromJson(
        "Undr",
        json,
        model
      );
      results["wU"] = results_wU;
      [results_wT, final_test_wT] = await jsonTesting.resultFromJson(
        "Tech",
        json,
        model
      );
      results["wT"] = results_wT;
      [results_wDU, final_test_wDU] = await jsonTesting.resultFromJson(
        "DescUndr",
        json,
        model
      );
      results["wDU"] = results_wDU;
      [results_wDT, final_test_wDT] = await jsonTesting.resultFromJson(
        "DescTech",
        json,
        model
      );
      results["wDT"] = results_wDT;
      [results_wUT, final_test_UT] = await jsonTesting.resultFromJson(
        "UndrTech",
        json,
        model
      );
      results["wUT"] = results_wUT;
      [results_wDUT, final_test_wDUT] = await jsonTesting.resultFromJson(
        "DescUndrTech",
        json,
        model
      );
      results["wDUT"] = results_wDUT;
      return results;
    } catch (error) {}
  } else {
    if (infProv.includes("WCAG Description")) {
      info += "Desc ";
    }
    if (infProv.includes("Understanding")) {
      info += "Undr ";
    }
    if (infProv.includes("Techniques")) {
      info += "Tech";
    }

    if (continuing) {
      // Get the test from the db
      [results, lastTest] = await jsonTesting.continueResultFromJson(
        info,
        json,
        model,
        continuing.upToNowTest,
        continuing.haltedTest
      );
      return [results, lastTest];
    } else {
      [results, lastTest] = await jsonTesting.resultFromJson(info, json, model);
      return [results, lastTest];
    }
  }
}

async function webTestAll(target, model) {
  const testWN = await testWegPage("testsWithNothing", target, model);
  console.log("FINISHED TWN");
  /* const testWD = await testWegPage("testsWithWcagDescription", url, model);
  console.log("FINISHED TWD"); */
  /* const testWU = await testWegPage("testsWithUnderstanding", url, model);
  console.log("FINISHED TWU"); */
  results = {
    twn: testWN,
    twd: testWN,
    twu: testWN,
  };

  return results;
}

async function finishTest(code, mongoTestResults) {
  await db.ResultJsons.find({ code: code }, function (err, doc) {
    if (err) {
      console.error(err);
    } else {
      const date = new Date();
      const formattedDate = formatter.format(date);
      db.ResultJsons.update(
        { _id: doc[0]._id },
        {
          $set: {
            test: mongoTestResults,
            status: "finished",
            date: formattedDate,
          },
        },
        function (err) {
          if (err) {
            console.error(err);
          }
        }
      );
    }
  });
}

async function haltTest(code, mongoTestResults, lastTest) {
  await db.ResultJsons.find({ code: code }, function (err, doc) {
    if (err) {
      console.error(err);
    } else {
      const date = new Date();
      const formattedDate = formatter.format(date);
      db.ResultJsons.update(
        { _id: doc[0]._id },
        {
          $set: {
            test: mongoTestResults,
            status: "halted",
            date: formattedDate,
            lastTest: lastTest,
          },
        },
        function (err) {
          if (err) {
            console.error(err);
          }
        }
      );
    }
  });
}

// Function to handle the test request
async function handleTestRequest(
  user,
  testSubject,
  model,
  code,
  testType,
  repeating,
  continuing,
  infProv
) {
  if (user && !repeating && !continuing) {
    await startTest(code);
  } else if (user && repeating) {
    await startRepeating(repeating);
  } else if (user && continuing) {
    await continueTest(continuing.code);
  }

  if (testType === "json") {
    [results, lastTest] = await jsonTest(
      testSubject,
      model,
      infProv,
      continuing
    );
  } else {
    results = await webTestAll(testSubject, model);
  }

  if (lastTest) {
    if (user && !repeating && !continuing) {
      await haltTest(code, results, la, lastTest);
    } else if (user && repeating) {
      await haltTest(repeating, results, lastTest);
    } else if (user && continuing) {
      await haltTest(continuing.code, results, lastTest);
    }
  } else {
    if (user && !repeating && !continuing) {
      await finishTest(code, results);
    } else if (user && repeating) {
      await finishTest(repeating, results);
    } else if (user && continuing) {
      await finishTest(continuing.code, results);
    }
  }

  return results;
}

router.post("/", async (req, res) => {
  user = req.body.user;
  testSubject = req.body.testSubject;
  model = req.body.model;
  testType = req.body.testType;
  priority = requestQueue.length;
  repeating = req.body.repeating;
  continuing = req.body.continue;
  infProv = req.body.informationProvided;

  let code = null;

  if (user && !repeating && !continuing) {
    code = await getID(user);
    await addNewTest(user, code, testType, testSubject, model, infProv);
  } else if (user && repeating) {
    await putOnRepeat(repeating);
  } else if (user && continuing) {
    await putOnContinue(continuing.code);
  }

  const result = await new Promise((resolve, reject) => {
    // Add the request to the queue
    requestQueue.push({
      user,
      testSubject,
      model,
      code,
      testType,
      repeating,
      continuing,
      infProv,
      priority: parseInt(priority),
      resolve,
      reject,
    });

    // Process the queue if not already processing
    if (requestQueue.length === 1) {
      processQueue();
    }
  });

  res.send(result); // Return the final result
});

removeDotsJson = (data) => {
  const newData = {};
  for (const key in data) {
    newData[key] = {};
    for (key2 in data[key]) {
      newData[key][key2] = {};
      for (key3 in data[key][key2]) {
        if (key3.startsWith("wcag20:")) {
          const parts = key3.split(":")[1].split(".");
          const fixedkey = `wcag20:${parts[0]}/${parts[1]}/${parts[2]}`;
          newData[key][key2][fixedkey] = data[key][key2][key3];
        } else {
          newData[key][key2][key3] = data[key][key2][key3];
        }
      }
    }
  }
  return newData;
};

removeDotsWeb = (data) => {
  newData = {};
  for (key in data) {
    newKey = key.replace(/\./g, "");
    newData[newKey] = data[key];
  }
  return newData;
};

router.post("/getResults", async (req, res) => {
  db.ResultJsons.find({ user: req.body.user }, function (err, doc) {
    if (err) {
      console.error(err);
      res.status(400).send({ message: err });
    } else {
      res.status(200).send(doc);
    }
  });
});

router.post("/deleteTest", async (req, res) => {
  id = req.body.id;
  db.ResultJsons.remove({ code: id }, function (err) {
    if (err) {
      console.error(err);
      res.status(400).send({ message: err });
    } else {
      res.status(200).send({ message: "Test deleted" });
    }
  });
});

module.exports = router;
