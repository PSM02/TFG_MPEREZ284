import React from "react";
import JsonCsvDataTable from "../json_option/CsvTable"; // Adjust the import path as needed

const JsonCsvSection = ({
  title,
  csvData,
  csvDownload,
  show,
  csv_download_name,
}) => {
  if (!csvData || !show) return null;

  return (
    <>
      <h2>{title}</h2>
      <div className="table-container">
        <a
          className="download-link"
          href={`data:text/csv;charset=utf-8,${csvDownload}`}
          download={csv_download_name.replace(/ /g, "") + ".csv"}
        >
          Download CSV
        </a>
        <JsonCsvDataTable data={csvData} />
      </div>
    </>
  );
};

export default JsonCsvSection;
