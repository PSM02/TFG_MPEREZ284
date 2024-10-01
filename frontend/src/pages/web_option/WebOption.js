import React, { useState } from "react";
import "./JsonOption.css";
import webJsonToCSV from "../../table_chart_generation/webTestToCSV";
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
];

function WebImputPage() {
  const [url, setUrl] = useState(null);
  const [displayJson, setdisplayJson] = useState(null);
  const [showJson, setShowJson] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State to track loading status
  const [csvData, setCsvData] = useState(null);
  const [csvDataDownload, setcsvDataDownload] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const loged = localStorage.getItem("user");

  const handleSelect = (item) => {
    setSelectedModel(item);
    console.log("Selected item:", item);
  };

  const handleInputChanged = (event) => {
    setUrl(event.target.value);
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
        testSubject: url,
        model: selectedModel,
        user: localStorage.getItem("user"),
        all: false,
        testType: "web",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setdisplayJson(data);
        setIsLoading(false); // Stop loading once data is received and processed
        let csv = webJsonToCSV(data);
        setcsvDataDownload(csv);
        Papa.parse(csv, {
          complete: (result) => {
            setCsvData(result.data);
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
      <h2>Give an url</h2>
      <input onChange={handleInputChanged} />
      {isLoading && <div className="loader" />}
      <button className="JsonButton" onClick={testWeb}>
        Test JSON
      </button>
      <button className="JsonButton" onClick={() => setShowJson(!showJson)}>
        {!showJson ? "Show JSON" : "Hide JSON"}
      </button>
      {showJson && displayJson && (
        <div className="json-display">
          <pre>{JSON.stringify(displayJson, null, 2)}</pre>
        </div>
      )}
      {csvDataDownload && (
        <div className="table-container">
          <a
            className="download-link"
            href={`data:text/csv;charset=utf-8,${csvDataDownload}`}
            download="data.csv"
          >
            Download CSV
          </a>
          <CsvDataTable data={csvData} />
        </div>
      )}
      <DropDownList onSelect={handleSelect} list={models} />
    </div>
  );
}

export default WebImputPage;