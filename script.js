const channelID = "3440149";

let airChart;


// ===============================
// GET LATEST SENSOR DATA
// ===============================

async function getSensorData() {

    try {

        const response = await fetch(
            `https://api.thingspeak.com/channels/${channelID}/feeds.json?results=1`
        );

        const data = await response.json();

        const latest = data.feeds[0];

        const airQuality = Number(latest.field1);
        const temperature = Number(latest.field2);
        const humidity = Number(latest.field3);


        // Display readings
        document.getElementById("air").textContent = airQuality;

        document.getElementById("temperature").textContent =
            temperature.toFixed(1);

        document.getElementById("humidity").textContent =
            humidity.toFixed(1);


        // Status
        const status = document.getElementById("status");

        if (airQuality < 1500) {

            status.textContent = "SAFE";
            status.style.color = "green";

        } else {

            status.textContent = "UNSAFE";
            status.style.color = "red";

        }


        // Last updated time
        document.getElementById("lastUpdated").textContent =
            "Last updated: " + new Date().toLocaleTimeString();


    } catch (error) {

        console.log("Sensor Error:", error);

        document.getElementById("status").textContent =
            "Connection Error";
    }
}



// ===============================
// AIR QUALITY HISTORY CHART
// ===============================

async function loadAirQualityChart() {

    try {

        const response = await fetch(
            `https://api.thingspeak.com/channels/${channelID}/feeds.json?results=20`
        );

        const data = await response.json();


        const labels = data.feeds.map(feed => {

            const date = new Date(feed.created_at);

            return date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            });

        });


        const airValues = data.feeds.map(feed =>
            Number(feed.field1)
        );


        const ctx = document.getElementById("airChart");


        // If chart already exists, destroy it
        if (airChart) {
            airChart.destroy();
        }


        airChart = new Chart(ctx, {

            type: "line",

            data: {

                labels: labels,

                datasets: [{

                    label: "Air Quality",

                    data: airValues,

                    borderWidth: 3,

                    pointRadius: 4,

                    pointHoverRadius: 7,

                    tension: 0.4,

                    fill: true

                }]
            },


            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        display: true,

                        position: "top"

                    },

                    tooltip: {

                        enabled: true

                    }

                },


                scales: {

                    y: {

                        beginAtZero: true,

                        title: {

                            display: true,

                            text: "Air Quality Value"

                        }

                    },


                    x: {

                        title: {

                            display: true,

                            text: "Time"

                        },

                        grid: {

                            display: false

                        }

                    }

                }

            }

        });


    } catch (error) {

        console.log("Chart Error:", error);

    }

}



// ===============================
// START DASHBOARD
// ===============================

getSensorData();

loadAirQualityChart();


// Update readings every 15 seconds
setInterval(getSensorData, 15000);


// Update chart every 15 seconds
setInterval(loadAirQualityChart, 15000);