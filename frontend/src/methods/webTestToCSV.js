// Convert JSON to CSV
function hWebJsonToCSV(jsonData) {
  const csvRows = [];
  // Headers
  csvRows.push("Accessibility_Requirement,Result,Time_Result,Html");

  // Data
  Object.entries(jsonData).forEach(([req, test]) => {
    for (let item in test) {
      if (item !== "time") {
        test[item] = test[item].replace(/\n/g, " ");
      }
    }
    if (test.hasOwnProperty("triggered_by")) {
      csvRows.push(`${req},${test.answer},${test.time},${test.triggered_by},`);
    } else {
      csvRows.push(`${req},${test.answer},${test.time},`);
    }
  });

  return csvRows.join("\n");
}

const webJsonToCSV = (jsonData) => {
  const csvData = hWebJsonToCSV(jsonData); // Ensure this is your correct function call
  return csvData;
};

export default webJsonToCSV;
