import React, { useState } from "react";
import "./JsonOption.css";
import jsonToCSV from "../../table_chart_generation/toCSV";
import Papa from "papaparse";
import CsvDataTable from "./CsvTable";

function JsonUploadPage() {
  const [jsonData, setJsonData] = useState(null);
  const [displayJson, setdisplayJson] = useState(null);
  const [showJson, setShowJson] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State to track loading status
  const [csvData, setCsvData] = useState(null);
  const [csvDataDownload, setcsvDataDownload] = useState(null);

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
        setdisplayJson(json);
        console.log("JSON data stored:", json);
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    };
    reader.readAsText(file);
  };

  const testJson = async () => {
    setIsLoading(true); // Start loading
    // Send the JSON data to the server /service/results/json
    fetch("http://localhost:3000/service/results/json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ json: jsonData }),
    })
      .then((response) => response.json())
      .then((data) => {
        setdisplayJson(data);
        setIsLoading(false); // Stop loading once data is received and processed
        let csv = jsonToCSV(data);
        setcsvDataDownload(csv);
        Papa.parse(csv, {
          complete: (result) => {
            setIsLoading(false);
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
      <script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js"></script>
      <h2>Upload a JSON File</h2>
      <input
        type="file"
        accept="application/json"
        onChange={handleFileChange}
      />
      {isLoading && <div className="loader"></div>}
      <button onClick={testJson}>Test JSON</button>
      <button onClick={() => setShowJson(!showJson)}>
        {!showJson && "Show JSON"}
        {showJson && "Hide JSON"}
      </button>
      {showJson && jsonData && (
        <div className="json-display">
          <pre>{JSON.stringify(displayJson, null, 2)}</pre>
        </div>
      )}
      {csvDataDownload && (
        <div class="table-container">
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
    </div>
  );
}

export default JsonUploadPage;
