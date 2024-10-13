import React from "react";
import "./CsvTable.css";

const CsvDataTable = ({ data }) => {
  console.log(data);
  if (!data || data.length === 0) return <p>No data to display</p>;

  // Filter out the __parsed_extra key and html from the headers
  const headers = Object.keys(data[0]).filter(
    (header) => header !== "__parsed_extra" && header !== "Html"
  );

  return (
    <table className="csv-table">
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Object.values(data).map((row) => (
          <React.Fragment>
            <tr>
              {headers.map((header) => (
                <td key={header}>{row[header]}</td>
              ))}
            </tr>
            {row["Html"] && (
              <tr className="html_place">
                <td colSpan={headers.length}>
                  {
                    // format the string to look like html
                    row["Html"]
                      //substitute all white spaces with a single space
                      .replace(/\s+/g, " ")
                      .replace(/>/g, ">\n")
                  }
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};

export default CsvDataTable;
