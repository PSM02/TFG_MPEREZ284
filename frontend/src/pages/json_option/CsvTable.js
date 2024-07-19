import React from "react";
import "./CsvTable.css";

const CsvDataTable = ({ data }) => {
  if (!data || data.length === 0) return <p>No data to display</p>;

  // Filter out the __parsed_extra key from the headers
  const headers = Object.keys(data[0]).filter(
    (header) => header !== "__parsed_extra"
  );

  return (
    <div className="table-container">
      {" "}
      {/* Ensure you have a div with class "table-container" for styling */}
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {headers.map((header) => (
                <td key={`${index}-${header}`}>{row[header]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CsvDataTable;
