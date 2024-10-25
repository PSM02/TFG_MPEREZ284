import React from "react";
import WebCsvDataTable from "../web_option/CsvTable"; // Adjust the import path as needed

const WebCsvSection = ({ title, csvData, csvDownload, csv_download_name }) => {
  if (!csvData) return null;

  return (
    <>
      <h2>{title}</h2>
      <div className="table-container">
        <a
          className="download-link"
          href={`data:text/csv;charset=utf-8,${csvData}`}
          download={csv_download_name}
        >
          Download CSV
        </a>
        <WebCsvDataTable data={csvData} />
      </div>
    </>
  );
};

export default WebCsvSection;
