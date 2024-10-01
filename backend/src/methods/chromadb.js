const fetch = require("node-fetch");

async function chromaQuery(query) {
  try {
    const url = new URL("http://localhost:5000/query");
    url.searchParams.append("query_text", query);
    url.searchParams.append("n_results", 5); // You can adjust the number of results as needed

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (response.ok) {
      console.log("Correctly fetched");
      return data;
    } else {
      console.error("Error fetching data:", data);
      throw new Error(data.message || "Failed to fetch data");
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

const pritnData = (data) => {
  for (const result of data.metadatas[0]) {
    console.log(result.criterias.split("_"));
  }
};

// Example usage
chromaQuery("technique1")
  .then((data) => pritnData(data))
  .catch((error) => console.error(error));
