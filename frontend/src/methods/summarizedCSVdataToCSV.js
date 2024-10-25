// Convert JSON to CSV
function hsummarzedToCSV(jsonData) {
  const csvRows = [];

  for (let part in jsonData) {
    csvRows.push(part + ",GuessRate");
    Object.values(jsonData[part]).forEach((testObj) => {
      csvRows.push(`${testObj.TestCase},${testObj.Results}`);
    });
    csvRows.push("\n");
  }

  return csvRows.join("\n");
}

const summarzedToCSV = (jsonData) => {
  const csvData = hsummarzedToCSV(jsonData); // Ensure this is your correct function call
  return csvData;
};

export default summarzedToCSV;
