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
import "./UserPage.css";

export default function UserPage() {
  const [tests, setTests] = useState([]);
  const [csvs, setCsvs] = useState([]);
  const [showList, setShowList] = useState([]);
  const [showAdvancedList, setShowAdvancedList] = useState([]);
  const [csv_downloads, setCsvDownloads] = useState([]);

  const setCsvsForJsonTest = (twn, twd, twu) => {
    let thisCsvs = [];
    let thisCsvDownloads = [];
    if (twn) {
      let csv_twn = jsonToCSV(twn);
      thisCsvDownloads.push(csv_twn);
      Papa.parse(csv_twn, {
        complete: (result) => {
          thisCsvs.push(result.data);
        },
        header: true,
        skipEmptyLines: true,
      });
    }
    if (twd) {
      let csv_twd = jsonToCSV(twd);
      thisCsvDownloads.push(csv_twd);
      Papa.parse(csv_twd, {
        complete: (result) => {
          thisCsvs.push(result.data);
        },
        header: true,
        skipEmptyLines: true,
      });
    }
    if (twu) {
      let csv_twu = jsonToCSV(twu);
      thisCsvDownloads.push(csv_twu);
      Papa.parse(csv_twu, {
        complete: (result) => {
          thisCsvs.push(result.data);
        },
        header: true,
        skipEmptyLines: true,
      });
    }
    return [thisCsvs, thisCsvDownloads];
  };

  const setCsvsForWebTest = (twn, twd, twu) => {
    let thisCsvs = [];
    let thisCsvDownloads = [];
    if (twn) {
      let csv_twn = webJsonToCSV(twn);
      thisCsvDownloads.push(csv_twn);
      Papa.parse(csv_twn, {
        complete: (result) => {
          thisCsvs.push(result.data);
        },
        header: true,
        skipEmptyLines: true,
      });
    }
    if (twd) {
      let csv_twd = webJsonToCSV(twd);
      thisCsvDownloads.push(csv_twd);
      Papa.parse(csv_twd, {
        complete: (result) => {
          thisCsvs.push(result.data);
        },
        header: true,
        skipEmptyLines: true,
      });
    }
    if (twu) {
      let csv_twu = webJsonToCSV(twu);
      thisCsvDownloads.push(csv_twu);
      Papa.parse(csv_twu, {
        complete: (result) => {
          thisCsvs.push(result.data);
        },
        header: true,
        skipEmptyLines: true,
      });
    }
    return [thisCsvs, thisCsvDownloads];
  };

  const showCsvs = (index, test) => {
    if (test.type === "json") {
      return (
        <>
          <SummarizedCSV data={ratesForTest(csvs[index])} />
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
          {/* <JsonCsvSection
            title="Test with nothing"
            csvData={csvs[index][0]}
            csvDownload={csv_downloads[index][0]}
            show={showAdvancedList[index]}
          />
          <JsonCsvSection
            title="Test with WCAG description"
            csvData={csvs[index][1]}
            csvDownload={csv_downloads[index][1]}
            show={showAdvancedList[index]}
          />
          <JsonCsvSection
            title="Test with understanding"
            csvData={csvs[index][2]}
            csvDownload={csv_downloads[index][2]}
            show={showAdvancedList[index]}
          /> */}
        </>
      );
    } else if (test.type === "web") {
      return (
        <React.Fragment>
          <WebCsvSection
            title="Test with nothing"
            csvData={csvs[index][0]}
            csvDownload={csv_downloads[index][0]}
          />
          <WebCsvSection
            title="Test with WCAG description"
            csvData={csvs[index][1]}
            csvDownload={csv_downloads[index][1]}
          />
          <WebCsvSection
            title="Test with understanding"
            csvData={csvs[index][2]}
            csvDownload={csv_downloads[index][2]}
          />
        </React.Fragment>
      );
    }
  };

  const repeatTest = async (test, index) => {
    const updatedTests = [...tests];
    updatedTests[index].status = "repeating";
    setTests(updatedTests);

    fetch("http://localhost:3001/service/results/json/", {
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

  const deleteTest = async (testId) => {
    setTests((tests) => tests.filter((test) => test.code !== testId));

    fetch("http://localhost:3001/service/results/json/deleteTest", {
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
      if (data[i].status === "finished") {
        data[i].testSubject = JSON.parse(data[i].testSubject);
        data[i].test = JSON.parse(data[i].test);
        console.log(data[i].test);
      }
      if (showList.length <= i) {
        showList.push(false);
        showAdvancedList.push(false);
      }
      if (data[i].type === "json") {
        if (data[i].status === "finished") {
          /* let [c, cd] = setCsvsForJsonTest(
            data[i].test.twn,
            data[i].test.twd,
            data[i].test.twu
          ); */
          let csv = jsonToCSV(data[i].test);
          csv_downloads.push(csv);
          Papa.parse(csv, {
            complete: (result) => {
              csvs.push(result.data);
            },
            header: true,
            skipEmptyLines: true,
          });
          /* csvs.push(c);
          csv_downloads.push(cd); */
        } else {
          csvs.push([]);
          csv_downloads.push([]);
        }
      } else {
        if (data[i].status === "finished") {
          let [c, cd] = setCsvsForWebTest(
            data[i].test.twn,
            data[i].test.twd,
            data[i].test.twu
          );
          csvs.push(c);
          csv_downloads.push(cd);
        } else {
          csvs.push([]);
          csv_downloads.push([]);
        }
      }
    }
    setShowAdvancedList(showAdvancedList);
    setCsvs(csvs);
    setCsvDownloads(csv_downloads);
  };

  const getTests = async () => {
    const userName = localStorage.getItem("user");
    fetch("http://localhost:3001/service/results/json/getResults", {
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
    const interval = setInterval(() => {
      getTests();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <React.Fragment>
      <LogedBar />
      <div className="user-page">
        <h1>User Page</h1>
        <ul>
          {tests.map((test, index) => (
            <li key={index}>
              <div className="testButtonPair">
                <button
                  className="testButton"
                  disabled={test.status !== "finished"}
                  onClick={() => {
                    showList[index] = !showList[index];
                    setShowList([...showList]);
                    console.log(showList);
                  }}
                >
                  {test.type} Test {index + 1}{" "}
                  {test.status === "finished" &&
                    " performed on " +
                      formatDate(test.date) +
                      " with " +
                      test.model}
                  {test.status === "started" && "Ongoing"}
                  {test.status === "started" && <div className="loader" />}
                  {test.status === "waiting" && "waiting to be processed"}
                  {test.status === "waitingRepeat" && "waiting to be repeated"}
                  {test.status === "repeating" && "being repeated"}
                  {test.status === "repeating" && <div className="loader" />}
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
              </div>
              {showList[index] === true &&
                test.status === "finished" &&
                showCsvs(index, test)}
            </li>
          ))}
        </ul>
      </div>
    </React.Fragment>
  );
}
