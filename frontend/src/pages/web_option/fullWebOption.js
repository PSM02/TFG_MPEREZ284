import React, { useState } from "react";
import "./JsonOption.css";
import webJsonToCSV from "../../methods/webTestToCSV";
import Papa from "papaparse";
import CsvDataTable from "./CsvTable";
import DropDownList from "../accesories/DropDownList";
import UpBar from "../principal/bar/UpBar";
import LogedBar from "../principal/bar/LogedBar";

const models = [
  "llama3-70b-8192",
  "mixtral-8x7b-32768",
  "gemma-7b-it",
  "whisper-large-v3",
  "gemini-1.5-flash",
];

function WebImputPage() {
  const [testTarget, setTestTarget] = useState({});
  const [testsWithNothing, setTestsWithNothing] = useState(null);
  const [testsWithWcagDescription, setTestsWithWcagDescription] =
    useState(null);
  const [testsWithUnderstanding, setTestsWithUnderstanding] = useState(null);
  const [showJson, setShowJson] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State to track loading status
  const [csv_twn_data, setcsv_twn_data] = useState(null);
  const [csv_twd_data, setcsv_twd_data] = useState(null);
  const [csv_twu_data, setcsv_twu_data] = useState(null);
  const [download_csv_twn, setdownload_csv_twn] = useState(null);
  const [download_csv_twd, setdownload_csv_twd] = useState(null);
  const [download_csv_twu, setdownload_csv_twu] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const loged = localStorage.getItem("user");

  const handleSelect = (item) => {
    setSelectedModel(item);
    console.log("Selected item:", item);
  };

  const handleURLChanged = (event) => {
    setTestTarget({ url: event.target.value });
  };

  const handleHTMLChanged = (event) => {
    setTestTarget({ html: event.target.value });
  };

  const handleHTMLFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const html = e.target.result;
        setTestTarget({ html: html });
      } catch (error) {
        console.error("Error parsing HTML:", error);
      }
    };
    reader.readAsText(file);
  };

  const testWeb = async () => {
    setIsLoading(true); // Start loading
    // Send the JSON data to the server /service/results/json
    fetch("http://localhost:3001/service/results/json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        testSubject: testTarget,
        model: selectedModel,
        user: localStorage.getItem("user"),
        all: false,
        testType: "web",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setTestsWithNothing(data.twn);
        setTestsWithWcagDescription(data.twd);
        setTestsWithUnderstanding(data.twu);
        setIsLoading(false); // Stop loading once data is received and processed
        let csv_twn = webJsonToCSV(data.twn);
        let csv_twd = webJsonToCSV(data.twd);
        let csv_twu = webJsonToCSV(data.twu);
        setdownload_csv_twn(csv_twn);
        setdownload_csv_twd(csv_twd);
        setdownload_csv_twu(csv_twu);
        Papa.parse(csv_twn, {
          complete: (result) => {
            setcsv_twn_data(result.data);
          },
          header: true,
          skipEmptyLines: true,
        });
        Papa.parse(csv_twd, {
          complete: (result) => {
            setcsv_twd_data(result.data);
          },
          header: true,
          skipEmptyLines: true,
        });
        Papa.parse(csv_twu, {
          complete: (result) => {
            setcsv_twu_data(result.data);
          },
          header: true,
          skipEmptyLines: true,
        });
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
      <div className="webTestGrid">
        <div className="web-input">
          <h2>Give ONE of the following</h2>
          <h4>Paste an URL</h4>
          <input onChange={handleURLChanged} />
          <h4>Paste a HTML</h4>
          <input type="text" onChange={handleHTMLChanged} />
          <h4>Upload a HTML</h4>
          <input
            type="file"
            accept="application/html"
            onChange={handleHTMLFileChange}
          />
        </div>
        {isLoading && <div className="loader" />}
        <div className="testOptions">
          <button className="JsonButton" onClick={testWeb}>
            Test Web
          </button>
          <button className="JsonButton" onClick={() => setShowJson(!showJson)}>
            {!showJson ? "Show JSON" : "Hide JSON"}
          </button>
          <DropDownList onSelect={handleSelect} list={models} />
        </div>
      </div>
      {showJson && testsWithNothing && (
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
      )}
      {download_csv_twn && (
        <div className="table-container">
          <a
            className="download-link"
            href={`data:text/csv;charset=utf-8,${download_csv_twn}`}
            download="data_twn.csv"
          >
            Download CSV TWN
          </a>
          TESTS WITH NOTHING
          <CsvDataTable data={csv_twn_data} />
        </div>
      )}
      {download_csv_twd && (
        <div className="table-container">
          <a
            className="download-link"
            href={`data:text/csv;charset=utf-8,${download_csv_twd}`}
            download="data_twd.csv"
          >
            Download CSV TWD
          </a>
          TEST WITH WCAG DESCRIPTION
          <CsvDataTable data={csv_twd_data} />
        </div>
      )}
      {download_csv_twu && (
        <div className="table-container">
          <a
            className="download-link"
            href={`data:text/csv;charset=utf-8,${download_csv_twu}`}
            download="data_twu.csv"
          >
            Download CSV TWU
          </a>
          TEST WITH UNDERSTANDING
          <CsvDataTable data={csv_twu_data} />
        </div>
      )}
    </div>
  );
}

export default WebImputPage;
