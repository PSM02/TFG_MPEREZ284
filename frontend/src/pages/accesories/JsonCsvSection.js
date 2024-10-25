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

  const handleDownload = () => {
    // Verify the number of lines in csvDownload
    const lines = csvDownload.split("\n");

    // Create a Blob from the CSV string
    const blob = new Blob([csvDownload], { type: "text/csv;charset=utf-8;" });

    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = csv_download_name.replace(/ /g, "") + ".csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <h2>{title}</h2>
      <div className="table-container">
        {/* <a
          className="download-link"
          href={`data:text/csv;charset=utf-8,${csvDownload}`}
          download={csv_download_name.replace(/ /g, "") + ".csv"}
        >
          Download CSV
        </a> */}

        <button onClick={handleDownload}>Download CSV</button>

        <JsonCsvDataTable data={csvData} />
      </div>
    </>
  );
};

export default JsonCsvSection;
