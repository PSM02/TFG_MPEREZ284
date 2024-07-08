const fs = require("fs");

// Example JSON data
const data = require("../data/test_results/testsWithNothing/gemma-7b-it.json");

// Convert JSON to CSV
function jsonToCSV(jsonData) {
  const csvRows = [];
  // Headers
  csvRows.push(
    "ActRule,Test,Accessibility_Requirement,Result,Expected_Result,Time_Applicable,Time_Result"
  );

  // Data
  Object.entries(jsonData).forEach(([actrule, tests]) => {
    //tests is a json object of tests
    Object.entries(tests).forEach(([test, testObj]) => {
      //testObj is a json object of test
      if (testObj.hasOwnProperty("inaplicable_rule")) {
        csvRows.push(
          `${actrule},${test},${testObj.inaplicable_rule},Inaplicable,${testObj.expected},${testObj.time_applicable},`
        );
      } else {
        //for each element in the test object
        Object.entries(testObj).forEach(([key, value]) => {
          if (key != "time_applicable") {
            csvRows.push(
              `${actrule},${test},${key},${value.result},${value.expected},${testObj.time_applicable},${value.time_result},`
            );
          }
        });
      }
    });
  });

  return csvRows.join("\n");
}

// Save CSV to file
const csvData = jsonToCSV(data);
fs.writeFile("./results.csv", csvData, (err) => {
  if (err) {
    console.error("Error writing to CSV file", err);
  } else {
    console.log("Successfully wrote to CSV file");
  }
});
