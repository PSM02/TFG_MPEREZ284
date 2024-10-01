import React from "react";
import WebCsvDataTable from "../web_option/CsvTable"; // Adjust the import path as needed

const WebCsvSection = ({ title, csvData, csvDownload, show }) => {
  if (!csvData) return null;

  return (
    <>
      <h2>{title}</h2>
      <div className="table-container">
        <a
          className="download-link"
          href={`data:text/csv;charset=utf-8,${csvDownload}`}
          download="data_twu.csv"
        >
          Download CSV TWU
        </a>
        <WebCsvDataTable data={csvData} />
      </div>
    </>
  );
};

export default WebCsvSection;
