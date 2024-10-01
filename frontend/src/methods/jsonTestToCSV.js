// Convert JSON to CSV
function hJsonToCSV(jsonData) {
  const csvRows = [];
  // Headers
  csvRows.push(
    "TestCase,ActRule,Accessibility_Requirement,Result,Expected_Result,Time_Applicable,Time_Result,Html"
  );

  // Data
  Object.entries(jsonData).forEach(([actrule, tests]) => {
    //tests is a json object of tests
    Object.entries(tests).forEach(([test, testObj]) => {
      //testObj is a json object of test
      if (testObj.hasOwnProperty("inaplicable_rule")) {
        testObj.concreteHTML = `"${testObj.concreteHTML
          .replace(/\n/g, " ")
          .replace(/"/g, '""')}"`;
        csvRows.push(
          `${test},${actrule},${testObj.inaplicable_rule},Inaplicable,${testObj.expected},${testObj.time_applicable},,${testObj.concreteHTML},`
        );
      } else {
        //for each element in the test object
        Object.entries(testObj).forEach(([key, value]) => {
          if (key !== "time_applicable") {
            // flaten the html string into on line
            value.concreteHTML = `"${value.concreteHTML
              .replace(/\n/g, " ")
              .replace(/"/g, '""')}"`;
            csvRows.push(
              `${test},${actrule},${key},${value.result},${value.expected},${testObj.time_applicable},${value.time_result},${value.concreteHTML},`
            );
          }
        });
      }
    });
  });

  return csvRows.join("\n");
}

const jsonToCSV = (jsonData) => {
  const csvData = hJsonToCSV(jsonData); // Ensure this is your correct function call
  return csvData;
};

export default jsonToCSV;
