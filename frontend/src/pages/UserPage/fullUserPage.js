import React from "react";
import { useState, useEffect } from "react";
import Papa from "papaparse";
import jsonToCSV from "../../methods/jsonTestToCSV";
import webJsonToCSV from "../../methods/webTestToCSV";
import LogedBar from "../principal/bar/LogedBar";
import SummarizedCSV from "../accesories/summarizedCSV";
import ratesForTest from "../../methods/summarizeCSV";
import JsonCsvSection from "../accesories/JsonCsvSection";
import WebCsvSection from "../accesories/WebCsvSection";
import OwnModelImput from "../accesories/OwnModelImput";
import summarzedToCSV from "../../methods/summarizedCSVdataToCSV";
import "./UserPage.css";

export default function UserPage() {
  const [tests, setTests] = useState([]);
  const [csvs, setCsvs] = useState([]);
  const [showList, setShowList] = useState([]);
  const [showAdvancedList, setShowAdvancedList] = useState([]);
  const [csv_downloads, setCsvDownloads] = useState([]);

  const showCsvs = (index, test) => {
    if (test.type === "json") {
      return (
        <>
          <div style={{ maxWidth: "500px" }}>
            <a
              className="download-link"
              href={`data:text/csv;charset=utf-8,${summarzedToCSV(
                ratesForTest(csvs[index])
              )}`}
              download={
                "jsonTestResultsWith" +
                test.informationProvided.join("_") +
                ".csv"
              }
            >
              Download Summarized CSV
            </a>
            <SummarizedCSV data={ratesForTest(csvs[index])} />
          </div>
          <button
            className="showAdvancedButton"
            onClick={() =>
              setShowAdvancedList((showAdvancedList) => {
                showAdvancedList[index] = !showAdvancedList[index];
                return [...showAdvancedList];
              })
            }
          >
            Show advanced
          </button>
          <JsonCsvSection
            title={"Test Results"}
            csvData={csvs[index]}
            csvDownload={csv_downloads[index]}
            show={showAdvancedList[index]}
            csv_download_name={
              "jsonTestResultsWith" +
              test.informationProvided.join("_") +
              ".csv"
            }
          />
        </>
      );
    } else if (test.type === "web") {
      return (
        <WebCsvSection
          title={"Test Results"}
          csvData={csvs[index]}
          csvDownload={csvs[index]}
          csv_download_name="webTestResults.csv"
        />
      );
    }
  };

  const repeatTest = async (test, index) => {
    const updatedTests = [...tests];
    updatedTests[index].status = "repeating";
    setTests(updatedTests);

    fetch("http://localhost:3003/service/results/json/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: localStorage.getItem("user"),
        testSubject: test.testSubject,
        model: test.model,
        testType: test.type,
        all: test.all,
        repeating: test.code,
        informationProvided: test.informationProvided,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        //console.log("Data:", data);
      });
  };

  const continueTest = async (test, index) => {
    const updatedTests = [...tests];
    updatedTests[index].status = "continuing";
    setTests(updatedTests);
    fetch("http://localhost:3003/service/results/json/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: localStorage.getItem("user"),
        testSubject: test.testSubject,
        model: test.model,
        testType: test.type,
        all: test.all,
        continue: {
          code: test.code,
          upToNowTest: test.test,
          haltedTest: test.lastTest,
        },
        informationProvided: test.informationProvided,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        //console.log("Data:", data);
      });
  };

  const deleteTest = async (testId) => {
    setTests((tests) => tests.filter((test) => test.code !== testId));

    fetch("http://localhost:3003/service/results/json/deleteTest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: testId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        //console.log("Data:", data);
      });
  };

  const formatDate = (date) => {
    const [rDate, time] = date.split(", ");
    return rDate + " at " + time;
  };

  const manageData = (data) => {
    let csvs = [];
    let csv_downloads = [];
    for (let i in data) {
      if (data[i].status === "finished" || data[i].status === "halted") {
        data[i].testSubject = JSON.parse(data[i].testSubject);
        data[i].test = JSON.parse(data[i].test);
      }
      if (showList.length <= i) {
        showList.push(false);
        showAdvancedList.push(false);
      }
      if (data[i].status === "finished" || data[i].status === "halted") {
        let csv = "";
        if (data[i].type === "json") {
          csv = jsonToCSV(data[i].test);
        } else {
          csv = webJsonToCSV(data[i].test);
        }
        csv_downloads.push(csv);
        Papa.parse(csv, {
          complete: (result) => {
            csvs.push(result.data);
          },
          header: true,
          skipEmptyLines: true,
        });
      } else {
        csvs.push([]);
        csv_downloads.push([]);
      }
    }
    setShowAdvancedList(showAdvancedList);
    setCsvs(csvs);
    setCsvDownloads(csv_downloads);
  };

  const getTests = async () => {
    const userName = localStorage.getItem("user");
    fetch("http://localhost:3003/service/results/json/getResults", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: userName,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setTests(data);
        manageData(data);
      });
  };

  useEffect(() => {
    getTests();
    const interval = setInterval(async () => {
      await getTests();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <React.Fragment>
      <LogedBar />
      <div className="user-page">
        <h1>User Page</h1>
        <OwnModelImput />
        <h3 style={{ marginTop: "50px" }}>Tests</h3>
        <ul>
          {tests.map((test, index) => (
            <li key={index}>
              <div className="testButtonPair">
                <button
                  className="testButton"
                  disabled={
                    test.status !== "finished" && test.status !== "halted"
                  }
                  onClick={() => {
                    showList[index] = !showList[index];
                    setShowList([...showList]);
                  }}
                >
                  {(test.status === "repeating" ||
                    test.status === "continuing" ||
                    test.status === "started") && <div className="loader" />}
                  {test.status === "started" && "Ongoing "}
                  {test.status === "halted" && "Halted "}
                  {test.status === "waiting" && "Waiting to be process "}
                  {test.status === "waitingRepeat" && "Waiting to repeat "}
                  {test.status === "repeating" && "Repeating "}
                  {test.status === "finished" && "Finished "}
                  {test.status === "continuing" && "Continuing "}
                  {test.type.toUpperCase() +
                    " test (providing " +
                    test.informationProvided.join(", ") +
                    ") with " +
                    test.model.model +
                    " (" +
                    test.model.llm +
                    ")"}
                  {test.status === "finished" &&
                    " performed on " + formatDate(test.date)}
                </button>
                {test.status === "finished" && (
                  <React.Fragment>
                    <button
                      className="testButton"
                      onClick={(e) => {
                        repeatTest(test, index);
                      }}
                    >
                      repeat
                    </button>
                    <button
                      className="testButton"
                      onClick={(e) => {
                        deleteTest(test.code);
                      }}
                    >
                      delete
                    </button>
                  </React.Fragment>
                )}
                {test.status === "halted" && (
                  <React.Fragment>
                    <button
                      className="testButton"
                      onClick={(e) => {
                        deleteTest(test.code);
                      }}
                    >
                      delete
                    </button>
                    <button
                      className="testButton"
                      onClick={(e) => {
                        continueTest(test, index);
                      }}
                    >
                      continue
                    </button>
                  </React.Fragment>
                )}
              </div>
              {showList[index] === true &&
                (test.status === "finished" || test.status === "halted") &&
                showCsvs(index, test)}
            </li>
          ))}
        </ul>
      </div>
    </React.Fragment>
  );
}
