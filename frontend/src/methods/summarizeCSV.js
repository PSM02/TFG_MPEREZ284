function SC_WCAG_Pinciples(data) {
  const sc = data.split(":")[1];
  const nums = sc.split(".");
  const wcag = nums[0] + "." + nums[1];
  const pinciple = nums[0];
  return [sc, wcag, pinciple];
}

function calculateGuessRates(csvData) {
  const data = { sc: {}, wcag: {}, principle: {} };
  const keys = { sc: [], wcag: [], principle: [] };
  for (const row of csvData) {
    const [sc, wcag, pinciple] = SC_WCAG_Pinciples(
      row.Accessibility_Requirement
    );

    if (!data.sc.hasOwnProperty(sc)) {
      data.sc[sc] = { count: 0, guesses: 0 };
      keys.sc.push(sc);
    }
    if (!data.wcag.hasOwnProperty(wcag)) {
      data.wcag[wcag] = { count: 0, guesses: 0 };
      keys.wcag.push(wcag);
    }
    if (!data.principle.hasOwnProperty(pinciple)) {
      data.principle[pinciple] = { count: 0, guesses: 0 };
      keys.principle.push(pinciple);
    }

    data.sc[sc].count += 1;
    data.wcag[wcag].count += 1;
    data.principle[pinciple].count += 1;

    if (row.Result.toLowerCase() === row.Expected_Result.toLowerCase()) {
      data.sc[sc].guesses += 1;
      data.wcag[wcag].guesses += 1;
      data.principle[pinciple].guesses += 1;
    }
  }

  return [data, keys];
}

/* function allCSV(twn, twd, twu) {
  let twnData;
  let twdData;
  let twuData;
  let keys = [];
  if (twn) {
    [twnData, keys] = calculateGuessRates(twn);
  }
  if (twd) {
    [twdData, keys] = calculateGuessRates(twd);
  }
  if (twu) {
    [twuData, keys] = calculateGuessRates(twu);
  }

  let finalCSVData = { principle: [], wcag: [], sc: [] };
  for (const key of ["principle", "wcag", "sc"]) {
    for (const key2 of keys[key].reverse()) {
      finalCSVData[key].push({
        TestCase: key2,
        Nothing:
          twnData === undefined
            ? "N/A"
            : (twnData[key][key2].guesses / twnData[key][key2].count) * 100 +
              "%",
        Desc:
          twdData === undefined
            ? "N/A"
            : (twdData[key][key2].guesses / twdData[key][key2].count) * 100 +
              "%",
        Understanding:
          twuData === undefined
            ? "N/A"
            : (twuData[key][key2].guesses / twuData[key][key2].count) * 100 +
              "%",
      });
    }
  }

  return finalCSVData;
} */

function ratesForTest(test) {
  let testData;
  let keys = [];
  if (test) {
    [testData, keys] = calculateGuessRates(test);
  }

  let finalCSVData = { principle: [], wcag: [], sc: [] };
  for (const key of ["principle", "wcag", "sc"]) {
    for (const key2 of keys[key]) {
      finalCSVData[key].push({
        TestCase: key2,
        Results:
          testData === undefined
            ? "N/A"
            : Math.round(
                (testData[key][key2].guesses / testData[key][key2].count) * 100
              ) + "%",
      });
    }
  }

  return finalCSVData;
}

export default ratesForTest;
