import Papa from "papaparse";

function calculateGuessRates(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      const csvData = event.target.result;
      Papa.parse(csvData, {
        header: true,
        complete: function (results) {
          const data = results.data;
          const guessRates = data.reduce((acc, row) => {
            const requirement = row.Accessibility_Requirement;
            const isCorrect = row.Expected_Result === row.Result;

            if (!acc[requirement]) {
              acc[requirement] = { correctGuesses: 0, totalAppearances: 0 };
            }

            if (isCorrect) {
              acc[requirement].correctGuesses += 1;
            }
            acc[requirement].totalAppearances += 1;

            return acc;
          }, {});

          resolve(guessRates);
        },
        error: function (err) {
          reject(err);
        },
      });
    };
    reader.onerror = function (err) {
      reject(err);
    };
    reader.readAsText(file);
  });
}
