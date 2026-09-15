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

        if (!response.ok) {
            throw new Error("ThingSpeak connection failed");
        }

        const data = await response.json();

        if (!data.feeds || data.feeds.length === 0) {
            throw new Error("No sensor data available");
        }

        const latest = data.feeds[0];

        const airQuality = Number(latest.field1);
        const temperature = Number(latest.field2);
        const humidity = Number(latest.field3);


        // ===============================
        // DISPLAY READINGS
        // ===============================

        document.getElementById("air").textContent = airQuality;

        document.getElementById("temperature").textContent =
            temperature.toFixed(1);

        document.getElementById("humidity").textContent =
            humidity.toFixed(1);


        // ===============================
        // AIR QUALITY LEVEL
        // ===============================

        const airLevel = document.getElementById("airLevel");

        if (airQuality < 1500) {

            airLevel.textContent = "GOOD";
            airLevel.style.color = "green";

        }
        else {

            airLevel.textContent = "POOR";
            airLevel.style.color = "red";

        }


        // ===============================
        // SAFE / UNSAFE STATUS
        // ===============================

        const status = document.getElementById("status");

        if (airQuality < 1500) {

            status.textContent = "SAFE";
            status.style.color = "green";

        }
        else {

            status.textContent = "UNSAFE";
            status.style.color = "red";

        }


        // ===============================
        // LAST UPDATED
        // ===============================

        document.getElementById("lastUpdated").textContent =
            "Last updated: " + new Date().toLocaleTimeString();

    }


    catch (error) {

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

        if (!response.ok) {
            throw new Error("Chart data connection failed");
        }

        const data = await response.json();


        // ===============================
        // CHART LABELS
        // ===============================

        const labels = data.feeds.map(feed => {

            const date = new Date(feed.created_at);

            return date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            });

        });


        // ===============================
        // AIR QUALITY VALUES
        // ===============================

        const airValues = data.feeds.map(feed =>
            Number(feed.field1)
        );


        const ctx = document.getElementById("airChart");


        // Destroy old chart
        if (airChart) {

            airChart.destroy();

        }


        // ===============================
        // CREATE CHART
        // ===============================

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

    }


    catch (error) {

        console.log("Chart Error:", error);

    }

}



// ===============================
// START DASHBOARD
// ===============================

getSensorData();

loadAirQualityChart();


// ===============================
// AUTO UPDATE EVERY 15 SECONDS
// ===============================

setInterval(getSensorData, 15000);

setInterval(loadAirQualityChart, 15000);
