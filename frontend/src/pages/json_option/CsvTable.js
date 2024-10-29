import React from "react";
import "./CsvTable.css";
import getTestInfo from "../../methods/getTestInfo";

const CsvDataTable = ({ data }) => {
  if (!data || data.length === 0) return <p>No data to display</p>;

  // Filter out the __parsed_extra key and html from the headers
  const headers = Object.keys(data[0]).filter(
    (header) =>
      header !== "__parsed_extra" &&
      header !== "Html" &&
      header !== "TestCase" &&
      header !== "Used_Prompt"
  );

  const rowTestInfo = {};
  data.forEach((row) => {
    const testInfo = getTestInfo(row["TestCase"]);
    rowTestInfo[row["TestCase"]] = testInfo;
  });

  const handleClick = (id) => {
    alert(JSON.stringify(rowTestInfo[id], null, 2));
  };

  return (
    <div className="table-container">
      <table className="csv-table">
        <thead>
          <tr>
            <th>TestCase</th>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <React.Fragment>
              <tr>
                <td onClick={() => handleClick(row["TestCase"])}>
                  {row["TestCase"]}
                </td>
                {headers.map((header) => (
                  <td>{row[header]}</td>
                ))}
              </tr>
              <tr className="html_place">
                <td colSpan={headers.length + 1}>
                  {
                    // format the string to look like html
                    row["Html"]
                      //substitute all white spaces with a single space
                      .replace(/\s+/g, " ")
                      .replace(/>/g, ">\n")
                  }
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CsvDataTable;
