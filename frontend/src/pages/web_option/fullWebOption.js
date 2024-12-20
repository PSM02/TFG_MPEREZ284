import React, { useState, useEffect } from "react";
import "./JsonOption.css";
import webJsonToCSV from "../../methods/webTestToCSV";
import Papa from "papaparse";
import CsvDataTable from "./CsvTable";
import DropDownList from "../accesories/DropDownList";
import UpBar from "../principal/bar/UpBar";
import LogedBar from "../principal/bar/LogedBar";
import CheckBoxList from "../accesories/CheckBoxList";
import SummarizedCSV from "../accesories/summarizedCSV";
import ratesForTest from "../../methods/summarizeCSV";

function WebImputPage() {
  const [models, setModels] = useState([
    { model: "llama3-70b-8192", llm: "groq" },
    { model: "mixtral-8x7b-32768", llm: "groq" },
    { model: "gemma-7b-it", llm: "groq" },
    { model: "whisper-large-v3", llm: "groq" },
    { model: "gemini-1.5-flash", llm: "gemini" },
    { model: "llama-3.2-90b-text-preview", llm: "groq" },
  ]);
  const [testTarget, setTestTarget] = useState({});
  const [currentTarget, setCurrentTarget] = useState(null);
  const [test, setTest] = useState(null);
  const [showJson, setShowJson] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [csv_data, setcsv_data] = useState(null);
  const [download_csv, setdownload_csv] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const loged = localStorage.getItem("user");

  const handleSelect = (item) => {
    setSelectedModel(item);
  };

  const handleURLChanged = (event) => {
    setTestTarget({ url: event.target.value });
    setCurrentTarget("URL");
  };

  const handleHTMLChanged = (event) => {
    setTestTarget({ html: event.target.value });
    setCurrentTarget("HTML");
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
        setCurrentTarget("uploaded HTML");
      } catch (error) {
        console.error("Error parsing HTML:", error);
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

  const manageData = (data) => {
    setIsLoading(false);
    setTest(data);
    let csv = webJsonToCSV(data);
    setdownload_csv(csv);
    Papa.parse(csv, {
      complete: (result) => {
        setcsv_data(result.data);
      },
      header: true,
      skipEmptyLines: true,
    });
  };

  const allInformation = () => {
    console.log(testTarget, selectedModel);
    if (testTarget && selectedModel) {
      return true;
    } else {
      let response = [];
      if (Object.keys(testTarget).length === 0) {
        response.push("Give a URL or HTML");
      }
      if (!selectedModel) {
        response.push("select a model");
      }
      return response;
    }
  };

  const testWeb = async () => {
    setErrorMessage(null);
    let allInformationProvided = allInformation();
    if (allInformationProvided === true) {
      setIsLoading(true); // Start loading
      // Send the JSON data to the server /service/results/json
      fetch("http://localhost:3003/service/results/json", {
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
          manageData(data);
        })
        .catch((error) => {
          console.error("Error sending JSON to server:", error);
          setIsLoading(false); // Also stop loading on error
          setErrorMessage("Error occurred at server");
        });
    } else {
      setErrorMessage(
        "Please provide all the information required, you need to " +
          allInformationProvided.join("and ")
      );
    }
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
      <div className="webTestGrid">
        <div className="web-input">
          <h2>Give ONE of the following</h2>
          <h4 style={{ marginTop: "20px" }}>Paste an URL</h4>
          <input onChange={handleURLChanged} onClick={handleURLChanged} />
          <h4 style={{ marginTop: "20px" }}>Paste a HTML</h4>
          <input
            type="text"
            onChange={handleHTMLChanged}
            onClick={handleHTMLChanged}
          />
          <h4 style={{ marginTop: "20px" }}>Upload a HTML</h4>
          <input
            type="file"
            accept="application/html"
            onChange={handleHTMLFileChange}
          />
          <h6 style={{ marginTop: "20px" }}>
            Currently using: {currentTarget || "None"}
          </h6>
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
      <hr></hr>
      {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
      <h6 className="left-text" style={{ marginTop: "20px" }}>
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
      {showJson && test && (
        <div className="json-display">
          TEST RESULTS
          <pre>{JSON.stringify(test, null, 2)}</pre>
        </div>
      )}
      {csv_data && (
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

export default WebImputPage;
