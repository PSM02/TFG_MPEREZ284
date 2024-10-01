import React from "react";
import "./CsvTable.css";

/* const SummarizedCSV = ({ data }) => {
  if (!data || data.length === 0) return <p>No data to display</p>;

  const headers = ["Test Case"];
  if (data.sc[0].Nothing !== "N/A") {
    headers.push("Nothing");
  }
  if (data.sc[0].Desc !== "N/A") {
    headers.push("Desc");
  }
  if (data.sc[0].Understanding !== "N/A") {
    headers.push("Understanding");
  }

  return (
    <React.Fragment>
      {Object.keys(data).map((key) => {
        return (
          <div key={key}>
            <h2>{key}</h2>
            <table className="csv-table">
              <thead>
                <tr>
                  {headers.map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data[key].map((row) => (
                  <tr key={row.TestCase}>
                    <td>{row.TestCase}</td>
                    {row.Nothing !== "N/A" && <td>{row.Nothing}</td>}
                    {row.Desc !== "N/A" && <td>{row.Desc}</td>}
                    {row.Understanding !== "N/A" && (
                      <td>{row.Understanding}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </React.Fragment>
  );
}; */

const SummarizedCSV = ({ data }) => {
  if (!data || data.length === 0) return <p>No data to display</p>;

  const headers = ["Test Case", "Guess Rate"];

  return (
    <React.Fragment>
      {Object.keys(data).map((key) => {
        return (
          <div key={key}>
            <h2>{key}</h2>
            <table className="csv-table">
              <thead>
                <tr>
                  {headers.map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data[key].map((row) => (
                  <tr key={row.TestCase}>
                    <td>{row.TestCase}</td>
                    <td>{row.Results}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </React.Fragment>
  );
};

export default SummarizedCSV;
