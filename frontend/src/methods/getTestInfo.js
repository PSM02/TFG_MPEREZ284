const tests = require("../data/original_test.json");

function getTestInfo(id) {
  let res = tests.testcases.filter((test) => {
    return test.testcaseId === id;
  });
  return res[0];
}

export default getTestInfo;
