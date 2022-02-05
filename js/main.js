'use strict'

window.onload = function() {
    getTopConfirmedCountries();
    getGlobalData();
}

/**
 * Gets COVID-19 related data by country and displays it in graphs.
 */
function getTopConfirmedCountries() {
    fetch("https://covid-api.mmediagroup.fr/v1/cases")
        .then((response) => response.json())
        .then((data) => {
            let countries = new Array();
            let chartData = new Array();
            let chartLabels = new Array();
            let date = new Date();

            // Iterate the retrieved object.
            Object.keys(data).map((key) => {
                // Each element is an object containing another object containing the data.
                // Insert the data of the innermost object in an array.
                let dataKey = Object.keys(data[key])[0];
                countries.push(data[key][dataKey]);

                if (!countries[countries.length - 1].country) {
                    countries[countries.length - 1].country = key;
                }
            });

            // Sort array by confirmed cases in descending order.
            countries.sort(function(a, b) {return b.confirmed - a.confirmed});
            console.log("Top confirmed cases by country:");
            console.log(countries);

            // Get top 5 countries skipping the first one which will always be Global.
            for (let i = 1; i < 6; i++) {
                chartLabels.push(countries[i].country);
                chartData.push(countries[i].confirmed);

                if (date < countries[i].updated || date == null) {
                    date = countries[i].updated;
                }
            }

            printConfirmedCountriesChart(chartLabels, chartData, date.toLocaleDateString());

            // Clear labels and data.
            chartLabels = [];
            chartData = [];

            // Sort array by confirmed deaths in descending order.
            countries.sort(function(a, b) {return b.deaths - a.deaths});
            console.log("Top confirmed deaths by country:");
            console.log(countries);

            // Get top 5 countries skipping the first one which will always be Global.
            for (let i = 1; i < 6; i++) {
                chartLabels.push(countries[i].country);
                chartData.push(countries[i].deaths);

                if (date < countries[i].updated || date == null) {
                    date = countries[i].updated;
                }
            }

            printDeathsCountriesChart(chartLabels, chartData, date.toLocaleDateString());
        });
}

/**
 * Gets global COVID-19 related data and displays it as KPIs.
 */
function getGlobalData() {
    let kpiDataElements = document.getElementsByClassName("kpiData");
    let kpiPercentageElements = document.getElementsByClassName("kpiPercentage");
    let kpiPercentageArrowElements = document.getElementsByClassName("kpiPercentageArrow");

    // Get global confirmed cases.
    fetch("https://covid-api.mmediagroup.fr/v1/history?country=Global&status=confirmed")
        .then((response) => response.json())
        .then((data) => {
            let dataKeys = new Array();
            let percentage;
            let percentageStr;

            // Get encapsulated data.
            data = data[Object.keys(data)[0]];
            data = data[Object.keys(data)[1]];
            dataKeys = Object.keys(data);
            
            console.log("Global confirmed cases history:");
            console.log(data);

            // Calculate the difference between the last two data records.
            percentage = getIncreaseDecreasePercentage(data[dataKeys[1]], data[dataKeys[0]]);
            percentageStr = getIncreaseDecreasePercentageStr(percentage);

            // Set percentage indicator arrow orientation.
            kpiPercentageArrowElements[0].classList.add((percentage < 0) ? "downArrow" : "upArrow");

            // Set the values of the data and change percentage.
            kpiDataElements[0].innerHTML = data[dataKeys[0]].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            kpiPercentageElements[0].innerHTML = percentageStr;
        });

    // Get global confirmed deaths.
    fetch("https://covid-api.mmediagroup.fr/v1/history?country=Global&status=deaths")
        .then((response) => response.json())
        .then((data) => {
            let dataKeys = new Array();
            let percentage;
            let percentageStr;

            // Get encapsulated data.
            data = data[Object.keys(data)[0]];
            data = data[Object.keys(data)[1]];
            dataKeys = Object.keys(data);
            
            console.log("Global confirmed deaths history:");
            console.log(data);

            // Calculate the difference between the last two data records.
            percentage = getIncreaseDecreasePercentage(data[dataKeys[1]], data[dataKeys[0]]);
            percentageStr = getIncreaseDecreasePercentageStr(percentage);

            // Set percentage indicator arrow orientation.
            kpiPercentageArrowElements[1].classList.add((percentage < 0) ? "downArrow" : "upArrow");

            // Set the values of the data and change percentage.
            kpiDataElements[1].innerHTML = data[dataKeys[0]].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            kpiPercentageElements[1].innerHTML = percentageStr;
        });

    // Get global vaccinations.
    fetch("https://covid-api.mmediagroup.fr/v1/vaccines?country=Global")
        .then((response) => response.json())
        .then((data) => {
            data = data[Object.keys(data)[0]];

            console.log("Global vaccinations:");
            console.log(data);

            // Set data on kpi element.
            kpiDataElements[2].innerHTML = data[Object.keys(data)[1]].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        });
}

/**
 * Calculates the percentage in which a new value has
 * increased or decreased in relation to and older value.
 * 
 * @param {number} oldValue Base number over which an increase or decrease has occurred.
 * @param {number} newValue Value obtained after increasing or decreasing the old value.
 * @param {number} decimals Number of decimals showed in the percentage
 * @returns Percentage in which the old value has changed.
 */
function getIncreaseDecreasePercentage(oldValue, newValue, decimals = 2) {
    let percentage;

    percentage = oldValue - newValue;
    percentage = percentage * 100;
    percentage = percentage / oldValue;
    percentage = percentage.toFixed(decimals);

    return percentage;
}

/**
 * Returns a string of the given number formatted as a percentage.
 * 
 * @param {number} percentage Number to be formatted.
 * @returns {string} String of a number formatted as a percentage.
 */
function getIncreaseDecreasePercentageStr(percentage) {
    let percentageStr;

    if (percentage < 0) {
        percentageStr = "- " + (percentage * (-1)).toString() + "%";
    } else {
        percentageStr = percentage.toString() + "%";
    }

    return percentageStr;
}

function printConfirmedCountriesChart(labels, data, date) {
    const ctx = document.getElementById('topConfirmedCountriesChart').getContext('2d');
    const topConfirmedCountriesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'COVID Confirmed cases / Country (' + date + ')',
                data: data,
                backgroundColor: [
                    '#01B8AA',
                    '#374649',
                    '#FD625E',
                    '#F2C80F',
                    '#5F6B6D'
                ],
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Top 5 countries with most confirmed COVID-19 cases',
                    font: {
                        size: 20
                    }
                }
            }
        }
    });
}

function printDeathsCountriesChart(labels, data, date) {
    const ctx = document.getElementById('topDeathsCountriesChart').getContext('2d');
    const topDeathsCountriesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'COVID Confirmed deaths / Country (' + date + ')',
                data: data,
                backgroundColor: [
                    '#01B8AA',
                    '#374649',
                    '#FD625E',
                    '#F2C80F',
                    '#5F6B6D'
                ],
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Top 5 countries with most confirmed deaths by COVID-19',
                    font: {
                        size: 20
                    }
                }
            }
        }
    });
}
