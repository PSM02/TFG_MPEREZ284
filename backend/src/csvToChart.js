const fs = require("fs");
const csv = require("csv-parser");
const { generateChart } = require("./chartGenerator");

function calculateGuessRates(csvFilePath) {
  return new Promise((resolve, reject) => {
    const results = {};
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (data) => {
        // Assuming 'Accessibility_Requirement' and 'Expected_Result' are column names
        const requirement = data.Accessibility_Requirement;
        const isCorrect = data.Expected_Result === data.Result;

        if (!results[requirement]) {
          results[requirement] = { correctGuesses: 0, totalAppearances: 0 };
        }

        if (isCorrect) {
          results[requirement].correctGuesses += 1;
        }
        results[requirement].totalAppearances += 1;
      })
      .on("end", () => {
        // Calculate guess rates
        const guessRates = Object.keys(results).map((requirement) => ({
          requirement,
          guessRate:
            (results[requirement].correctGuesses /
              results[requirement].totalAppearances) *
            100,
        }));

        resolve(guessRates);
      })
      .on("error", reject);
  });
}

// Example usage
const csvFilePath = "backend/data/results.csv";
main = async () => {
  const data = await calculateGuessRates(csvFilePath);
  console.log(data);
  generateChart(data);
};

main();
