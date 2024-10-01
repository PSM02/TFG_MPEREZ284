import React, { useState } from "react";
import "./JsonOption.css";
import jsonToCSV from "../../methods/jsonTestToCSV";
import Papa from "papaparse";
import CsvDataTable from "./CsvTable";
import DropDownList from "../accesories/DropDownList";
import CheckBoxList from "../accesories/CheckBoxList";
import UpBar from "../principal/bar/UpBar";
import LogedBar from "../principal/bar/LogedBar";
import SummarizedCSV from "../accesories/summarizedCSV";
import ratesForTest from "../../methods/summarizeCSV";

const models = [
  "llama3-70b-8192",
  "mixtral-8x7b-32768",
  "gemma-7b-it",
  "whisper-large-v3",
  "gemini-1.5-flash",
  "llava-v1.5-7b-4096-preview",
];

const informationTypes = [
  "WCAG Description",
  "Understanding",
  "Techniques",
  "All",
];

function JsonUploadPage() {
  const [jsonData, setJsonData] = useState(null);
  const [test, setTest] = useState(null);
  /*   const [testsWithNothing, setTestsWithNothing] = useState(null);
  const [testsWithWcagDescription, setTestsWithWcagDescription] =
    useState(null);
  const [testsWithUnderstanding, setTestsWithUnderstanding] = useState(null); */
  const [showJson, setShowJson] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State to track loading status
  const [csv_data, setcsv_data] = useState(null);
  /* const [csv_twn_data, setcsv_twn_data] = useState(null);
  const [csv_twd_data, setcsv_twd_data] = useState(null);
  const [csv_twu_data, setcsv_twu_data] = useState(null); */
  const [download_csv, setdownload_csv] = useState(null);
  /* const [download_csv_twn, setdownload_csv_twn] = useState(null);
  const [download_csv_twd, setdownload_csv_twd] = useState(null);
  const [download_csv_twu, setdownload_csv_twu] = useState(null); */
  const [selectedModel, setSelectedModel] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  //const [isAllChecked, setIsAllChecked] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const loged = localStorage.getItem("user");

  const handleSelect = (item) => {
    setSelectedModel(item);
    console.log("Selected item:", item);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        setJsonData(json);
        console.log("JSON data stored:", json);
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    };
    reader.readAsText(file);
  };

  /*   const manageTestsWithNothing = (twn) => {
    setTestsWithNothing(twn);
    let csv_twn = jsonToCSV(twn);
    setdownload_csv_twn(csv_twn);
    Papa.parse(csv_twn, {
      complete: (result) => {
        setcsv_twn_data(result.data);
      },
      header: true,
      skipEmptyLines: true,
    });
  };

  const manageTestsWithWcagDescription = (twd) => {
    setTestsWithWcagDescription(twd);
    let csv_twd = jsonToCSV(twd);
    setdownload_csv_twd(csv_twd);
    Papa.parse(csv_twd, {
      complete: (result) => {
        setcsv_twd_data(result.data);
      },
      header: true,
      skipEmptyLines: true,
    });
  };

  const manageTestsWithUnderstanding = (twu) => {
    setTestsWithUnderstanding(twu);
    let csv_twu = jsonToCSV(twu);
    setdownload_csv_twu(csv_twu);
    Papa.parse(csv_twu, {
      complete: (result) => {
        setcsv_twu_data(result.data);
      },
      header: true,
      skipEmptyLines: true,
    });
  }; */

  const manageData = (data) => {
    setIsLoading(false);
    setTest(data);
    let csv = jsonToCSV(data);
    setdownload_csv(csv);
    Papa.parse(csv, {
      complete: (result) => {
        setcsv_data(result.data);
      },
      header: true,
      skipEmptyLines: true,
    });
  };

  const testJson = async () => {
    setIsLoading(true); // Start loading
    // Send the JSON data to the server /service/results/json
    fetch("http://localhost:3001/service/results/json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        testSubject: jsonData,
        model: selectedModel,
        user: localStorage.getItem("user"),
        testType: "json",
        informationProvided: Object.keys(checkedItems),
      }),
    })
      .then((response) => response.json())
      .then(async (data) => {
        await manageData(data);
      })
      .catch((error) => {
        console.error("Error sending JSON to server:", error);
        setIsLoading(false); // Also stop loading on error
      });
  };

  return (
    <div className="container">
      {loged ? <LogedBar /> : <UpBar />}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js"></script>
      <h2>Upload a JSON File</h2>
      <input
        type="file"
        accept="application/json"
        onChange={handleFileChange}
      />
      {isLoading && <div className="loader" />}
      <button className="JsonButton" onClick={testJson}>
        Test JSON
      </button>
      <button className="JsonButton" onClick={() => setShowJson(!showJson)}>
        {!showJson ? "Show JSON" : "Hide JSON"}
      </button>
      <div className="testOptionsDiv">
        <CheckBoxList
          items={informationTypes}
          checkedItems={checkedItems}
          setCheckedItems={setCheckedItems}
        />
        <DropDownList onSelect={handleSelect} list={models} />
      </div>
      {showJson && jsonData && (
        <div className="json-display">
          JSON TO TEST
          <pre>{JSON.stringify(jsonData, null, 2)}</pre>
        </div>
      )}
      {showJson && test && (
        <div className="json-display">
          TEST RESULTS
          <pre>{JSON.stringify(test, null, 2)}</pre>
        </div>
      )}
      {/* {showJson && testsWithNothing && (
        <div className="json-display">
          TESTS WITH NOTHING
          <pre>{JSON.stringify(testsWithNothing, null, 2)}</pre>
        </div>
      )}
      {showJson && testsWithWcagDescription && (
        <div className="json-display">
          TESTS WITH WCAG DESCRIPTION
          <pre>{JSON.stringify(testsWithWcagDescription, null, 2)}</pre>
        </div>
      )}
      {showJson && testsWithUnderstanding && (
        <div className="json-display">
          TESTS WITH UNDERSTANDING
          <pre>{JSON.stringify(testsWithUnderstanding, null, 2)}</pre>
        </div>
      )} */}
      {csv_data && <SummarizedCSV data={ratesForTest(csv_data)} />}
      {csv_data && (
        <button onClick={() => setShowAdvanced(!showAdvanced)}>
          Show Advanced
        </button>
      )}
      {/* {(csv_twn_data || csv_twd_data || csv_twu_data) && (
        <SummarizedCSV
          data={allCSV(csv_twn_data, csv_twd_data, csv_twu_data)}
        />
      )}
      {(csv_twn_data || csv_twd_data || csv_twu_data) && (
        <button onClick={() => setShowAdvanced(!showAdvanced)}>
          Show Advanced
        </button>
      )} */}
      {showAdvanced && csv_data && (
        <div className="table-container">
          <a
            className="download-link"
            href={`data:text/csv;charset=utf-8,${download_csv}`}
            download={
              "jsonTestResultsWith" +
              Object.keys(checkedItems).join("_").replace(" ", "") +
              ".csv"
            }
          >
            Download CSV
          </a>
          <CsvDataTable data={csv_data} />
        </div>
      )}
      {/* {showAdvanced && download_csv_twn && (
        <div className="table-container">
          <a
            className="download-link"
            href={`data:text/csv;charset=utf-8,${download_csv_twn}`}
            download="data_twn.csv"
          >
            Download CSV TWN
          </a>
          <CsvDataTable data={csv_twn_data} />
        </div>
      )}
      {showAdvanced && download_csv_twd && (
        <div className="table-container">
          <a
            className="download-link"
            href={`data:text/csv;charset=utf-8,${download_csv_twd}`}
            download="data_twd.csv"
          >
            Download CSV TWD
          </a>
          <CsvDataTable data={csv_twd_data} />
        </div>
      )}
      {showAdvanced && download_csv_twu && (
        <div className="table-container">
          <a
            className="download-link"
            href={`data:text/csv;charset=utf-8,${download_csv_twu}`}
            download="data_twu.csv"
          >
            Download CSV TWU
          </a>
          <CsvDataTable data={csv_twu_data} />
        </div>
      )} */}
    </div>
  );
}

export default JsonUploadPage;
