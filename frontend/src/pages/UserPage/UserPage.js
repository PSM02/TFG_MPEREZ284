import React from "react";
import { useState, useEffect } from "react";
import Papa from "papaparse";
import jsonToCSV from "../../table_chart_generation/jsonTestToCSV";
import CsvDataTable from "../json_option/CsvTable";
import LogedBar from "../principal/bar/LogedBar";
import "./UserPage.css";

export default function UserPage() {
  const [tests, setTests] = useState([]);
  const [csvs, setCsvs] = useState([]);
  const [showList, setShowList] = useState([]);

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
        console.log("Data:", data);
        setTests(data);
        for (let i = 0; i < data.length; i++) {
          if (data[i].status === "finished") {
            setShowList((showList) => [...showList, false]);
            let csv = jsonToCSV(data[i].test);
            Papa.parse(csv, {
              complete: (result) => {
                setCsvs((csvs) => [...csvs, result.data]);
              },
              header: true,
              skipEmptyLines: true,
            });
          }
        }
      })
      .catch((error) => {
        console.error("Error sending JSON to server:", error);
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
              <button
                disabled={test.status !== "finished"}
                onClick={() => {
                  showList[index] = !showList[index];
                  setShowList([...showList]);
                }}
              >
                Test {index + 1} {test.status === "started" && "Ongoing"}
                {test.status === "waiting" && "waiting to be processed"}
                {test.status === "started" && <div className="loader" />}
              </button>

              {showList[index] === true && test.status === "finished" && (
                <CsvDataTable data={csvs[index]} />
              )}
            </li>
          ))}
        </ul>
      </div>
    </React.Fragment>
  );
}
