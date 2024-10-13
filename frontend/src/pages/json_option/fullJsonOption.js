import React, { useState, useEffect } from "react";
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

const informationTypes = [
  "WCAG Description",
  "Understanding",
  "Techniques",
  "All",
];

function JsonUploadPage() {
  const [models, setModels] = useState([
    { model: "llama3-70b-8192", llm: "groq" },
    { model: "mixtral-8x7b-32768", llm: "groq" },
    { model: "gemma-7b-it", llm: "groq" },
    { model: "whisper-large-v3", llm: "groq" },
    { model: "gemini-1.5-flash", llm: "gemini" },
    { model: "llama-3.2-90b-text-preview", llm: "groq" },
  ]);
  const [jsonData, setJsonData] = useState(null);
  const [test, setTest] = useState(null);
  const [showJson, setShowJson] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [csv_data, setcsv_data] = useState(null);
  const [download_csv, setdownload_csv] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const loged = localStorage.getItem("user");

  const handleSelect = (item) => {
    setSelectedModel(item);
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

  const handleOwnModelInfo = (event) => {
    //take the father element of the input
    const father = event.target.parentElement;
    //now the value of each child
    const llm = father.children[1].value;
    const model = father.children[2].value;
    const api_key = father.children[3].value;
    setSelectedModel({ model: model, llm: llm, api_key: api_key });
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
    fetch("http://localhost:3003/service/results/json", {
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
        setErrorMessage("Error occurred at server");
      });
  };

  const catchOwnModels = async () => {
    if (loged) {
      fetch("http://localhost:3003/api/user/getUserInfo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: localStorage.getItem("user"),
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          Object.keys(data.ownModels).forEach((key) => {
            if (!models.find((model) => model.model === key)) {
              models.push({
                model: key,
                llm: data.ownModels[key].llm,
                api_key: data.ownModels[key].api_key,
              });
            }
          });
          setModels([...models]);
        })
        .catch((error) => {
          console.error("Error sending JSON to server:", error);
        });
    }
  };

  useEffect(() => {
    setInterval(async () => {
      await catchOwnModels();
    }, 1000);
  }, []);

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
      {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
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
      <hr></hr>
      <h6 className="left-text">
        If you want to test a model that is not in the list, please provide the
        llm name, model name and api_key:
      </h6>
      <div className="input-group">
        <span className="input-group-text">
          llm name, model name and api_key:
        </span>
        <input
          type="text"
          aria-label="llm"
          className="form-control"
          onChange={handleOwnModelInfo}
        />
        <input
          type="text"
          aria-label="model"
          className="form-control"
          onChange={handleOwnModelInfo}
        />
        <input
          type="text"
          aria-label="api_key"
          className="form-control"
          onChange={handleOwnModelInfo}
        />
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
      {csv_data && <SummarizedCSV data={ratesForTest(csv_data)} />}
      {csv_data && (
        <button onClick={() => setShowAdvanced(!showAdvanced)}>
          Show Advanced
        </button>
      )}
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
    </div>
  );
}

export default JsonUploadPage;
