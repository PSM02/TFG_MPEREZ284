const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const fs = require("fs");
const width = 800; // Width of the chart
const height = 600; // Height of the chart
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

module.exports = {
  generateChart: async function (data) {
    const configuration = {
      type: "bar",
      data: {
        labels: data.map((d) => d.requirement),
        datasets: [
          {
            label: "Guess Rate",
            data: data.map((d) => d.guessRate),
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    };

    const image = await chartJSNodeCanvas.renderToBuffer(configuration);
    fs.writeFileSync("chart.png", image);
  },
};
