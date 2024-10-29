// Convert JSON to CSV
function hJsonToCSV(jsonData) {
  const csvRows = [];
  // Headers
  csvRows.push(
    "TestCase,ActRule,Accessibility_Requirement,Result,Expected_Result,Time_Applicable,Time_Result,Html,Used_Prompt"
  );

  // Data
  Object.entries(jsonData).forEach(([actrule, tests]) => {
    //tests is a json object of tests
    Object.entries(tests).forEach(([test, testObj]) => {
      //for each element in the test object
      Object.entries(testObj).forEach(([key, value]) => {
        // flaten the html string into on line
        value.concreteHTML = `"${value.concreteHTML
          .replace(/\n/g, " ")
          .replace(/"/g, '""')
          .replace(/,/g, ";")}"`;
        if (value.hasOwnProperty("time_result")) {
          csvRows.push(
            `${test},${actrule},${key},${value.result},${value.expected},${value.time_applicable},${value.time_result},${value.concreteHTML},${value.prompt},`
          );
        } else {
          csvRows.push(
            `${test},${actrule},${key},${value.result},${value.expected},${value.time_applicable},,${value.concreteHTML},${value.prompt},`
          );
        }
      });
    });
  });
  return csvRows.join("\n");
}

const jsonToCSV = (jsonData) => {
  const csvData = hJsonToCSV(jsonData); // Ensure this is your correct function call
  return csvData;
};

export default jsonToCSV;
