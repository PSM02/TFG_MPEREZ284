const fetch = require("node-fetch");

async function chromaQuery(criteria) {
  try {
    const url = new URL("http://localhost:5000/query");
    url.searchParams.append("query_text", "");
    url.searchParams.append("criteria", criteria);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (response.ok) {
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

searchTechniques = async (criteria) => {
  try {
    const data = await chromaQuery(criteria);
    return data.documents[0];
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

module.exports = searchTechniques;
