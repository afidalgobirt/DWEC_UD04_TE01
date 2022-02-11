'use strict'

const STATUS_CONFIRMED = 1;
const STATUS_DEATHS = 2;

var countryDetailsCasesCharts = new Array();
var countryDetailsDeathsCharts = new Array();
var countryStatusColor = new Array();

getTopConfirmedCountries();
getGlobalData();

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

            printDataTable(countries);

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
            data = data['dates'];
            dataKeys = Object.keys(data);
            
            console.log("Global confirmed cases history:");
            console.log(data);

            // Calculate the difference between the last two data records.
            percentage = getIncreaseDecreasePercentage(data[dataKeys[1]], data[dataKeys[0]]);
            percentageStr = getPercentageStr(percentage);

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
            data = data['dates'];
            dataKeys = Object.keys(data);
            
            console.log("Global confirmed deaths history:");
            console.log(data);

            // Calculate the difference between the last two data records.
            percentage = getIncreaseDecreasePercentage(data[dataKeys[1]], data[dataKeys[0]]);
            percentageStr = getPercentageStr(percentage);

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
    return getPercentage(oldValue, oldValue - newValue, decimals);
}

/**
 * Returns the percentage of a value over a base value.
 * 
 * @param {number} baseValue Value that's equal 100%.
 * @param {number} value Value to calculate the percentage over baseValue.
 * @param {number} decimals Number of decimals showed in the percentage.
 * @returns The percentage of a value over a base value.
 */
function getPercentage(baseValue, value, decimals = 2) {
    let percentage;

    if (!baseValue || !value) {
        percentage =  NaN;
    } else {
        percentage = (value * 100) / baseValue;
        percentage = percentage.toFixed(decimals);
    }

    return percentage;
}

/**
 * Returns a string of the given number formatted as a percentage.
 * 
 * @param {number} percentage Number to be formatted.
 * @returns {string} String of a number formatted as a percentage.
 */
function getPercentageStr(percentage) {
    let percentageStr;

    if (isNaN(percentage) || !isFinite(percentage)) {
        percentageStr = "Unknown";
    } else if (percentage < 0) {
        percentageStr = "- " + (percentage * (-1)).toString() + "%";
    } else {
        percentageStr = percentage.toString() + "%";
    }

    return percentageStr;
}

function printDataTable(_data) {
    let data = new Array();
    let dataTable = document.getElementById('dataTable');
    let tbody, tr, td;
    let percentage;
    let canvasContainer;
    let canvas;
    let detailsContainer;

    data = _data;
    tbody = document.createElement('tbody');

    data.forEach((obj) => {
        // Get Cases / Population percentage.
        percentage = getPercentage(obj.population, obj.confirmed, 2);
        countryStatusColor[obj.country] = {
            cases: '',
            deaths: ''
        };

        tr = document.createElement('tr');

        // Insert data for column Country.
        td = document.createElement('td');
        td.appendChild(document.createTextNode(obj.country));

        td.style.borderLeftWidth = '4px';
        td.style.borderLeftStyle = 'solid';

        if (percentage <= 10) {
            countryStatusColor[obj.country].cases = '#01B8AA';
        } else if (percentage <= 25) {
            countryStatusColor[obj.country].cases = '#F2C80F';
        } else if (percentage <= 100) {
            countryStatusColor[obj.country].cases = '#FD625E';
        } else {
            countryStatusColor[obj.country].cases = '#5F6B6D';
        }

        td.style.borderLeftColor = countryStatusColor[obj.country].cases;

        tr.appendChild(td);

        // Insert data for column Cases.
        td = document.createElement('td');

        if (obj.confirmed) {
            td.appendChild(document.createTextNode(obj.confirmed.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")));
        } else {
            td.appendChild(document.createTextNode("Unknown"));
            td.style.color = '#5F6B6D';
            td.style.fontWeight = 'bold';
        }
        
        tr.appendChild(td);

        // Insert data for column Cases / Population (%).
        td = document.createElement('td');

        td.style.fontWeight = 'bold';
        td.style.color = countryStatusColor[obj.country].cases;

        td.appendChild(document.createTextNode(getPercentageStr(percentage)));
        tr.appendChild(td);

        // Insert data for column Deaths.
        td = document.createElement('td');

        if (obj.deaths) {
            td.appendChild(document.createTextNode(obj.deaths.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")));
        } else {
            td.appendChild(document.createTextNode("Unknown"));
            td.style.color = '#5F6B6D';
            td.style.fontWeight = 'bold';
        }
        
        tr.appendChild(td);

        // Insert data for column Deaths / Cases (%).
        td = document.createElement('td');
        // Get Deaths / Cases percentage.
        percentage = getPercentage(obj.confirmed, obj.deaths, 2);

        if (percentage <= 10) {
            countryStatusColor[obj.country].deaths = '#01B8AA';
        } else if (percentage <= 25) {
            countryStatusColor[obj.country].deaths = '#F2C80F';
        } else if (percentage <= 100) {
            countryStatusColor[obj.country].deaths = '#FD625E';
        } else {
            countryStatusColor[obj.country].deaths = '#5F6B6D';
        }

        td.style.color = countryStatusColor[obj.country].deaths;
        td.style.fontWeight = 'bold';

        td.appendChild(document.createTextNode(getPercentageStr(percentage)));
        tr.appendChild(td);

        // Insert data for column Population.
        td = document.createElement('td');

        if (obj.population) {
            td.appendChild(document.createTextNode(obj.population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")));
        } else {
            td.appendChild(document.createTextNode("Unknown"));
            td.style.color = '#5F6B6D';
            td.style.fontWeight = 'bold';
        }
        
        tr.appendChild(td);

        // Make row clickable to show details in hidden row.
        tr.classList.add('clickableRow');
        tr.onclick = dataTableRowClicked;

        // Add row to the table.
        tbody.appendChild(tr);

        // Add hidden details row.
        tr = document.createElement('tr');
        tr.classList.add('detailsRow');
        tr.style.display = 'none';
        tr.style.borderLeftColor = countryStatusColor[obj.country].cases;
        tr.style.borderLeftWidth = '4px';
        tr.style.borderLeftStyle = 'solid';

        td = document.createElement('td');
        td.colSpan = 6;

        detailsContainer = document.createElement('div');
        detailsContainer.classList.add('detailsChartContainer');

        canvasContainer = document.createElement('div');
        canvasContainer.classList.add('chartContainer');

        canvas = document.createElement('canvas');
        canvas.id = obj.country + "DetailCasesChart";
        canvasContainer.appendChild(canvas);
        detailsContainer.appendChild(canvasContainer);

        canvasContainer = document.createElement('div');
        canvasContainer.classList.add('chartContainer');

        canvas = document.createElement('canvas');
        canvas.id = obj.country + "DetailDeathsChart";
        canvasContainer.appendChild(canvas);
        detailsContainer.appendChild(canvasContainer);

        td.appendChild(detailsContainer);
        tr.appendChild(td);

        tbody.appendChild(tr);
    });

    dataTable.appendChild(tbody);
}

function dataTableRowClicked(event) {
    var row = event.target.parentElement;
    var detailsRow = row.nextSibling;
    var country = row.firstChild.textContent;

    if (detailsRow.style.display == 'none') {
        detailsRow.style.display = '';

        if (!countryDetailsCasesCharts[country]) {
            printDetailsCharts(country, STATUS_CONFIRMED);
        }

        if (!countryDetailsDeathsCharts[country]) {
            printDetailsCharts(country, STATUS_DEATHS);
        }
    } else {
        detailsRow.style.display = 'none';
    }
}

function printDetailsCharts(country, status) {
    let url = "https://covid-api.mmediagroup.fr/v1/history?country=" + country + "&status=";
    
    switch (status) {
        case STATUS_CONFIRMED:
            url += "confirmed";
            break;
        case STATUS_DEATHS:
            url += "deaths";
            break;
    }

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            let keys = new Array();
            let chartLabels = new Array();
            let chartData = new Array();
            let date;
            let dateStr;

            data = data[Object.keys(data)[0]];
            data = data['dates'];

            keys = Object.keys(data);
            date = new Date(keys[0]);
            date.setDate(1);
            dateStr = date.toLocaleDateString();

            for (let key of keys) {
                if (new Date(key).toLocaleDateString() == dateStr) {
                    chartLabels.push(dateStr);
                    chartData.push(data[key]);

                    if (chartData.length == 10) {
                        break;
                    }

                    date.setMonth(date.getMonth() - 1);
                    date.setDate(1);
                    dateStr = date.toLocaleDateString();
                }
            }

            chartLabels = chartLabels.reverse();
            chartData = chartData.reverse();

            printCountryDetailsCharts(chartLabels, chartData, country, status);
        });
}

function printCountryDetailsCharts(labels, data, country, status) {
    let canvasId;
    let datasetLabel;
    let title;

    switch (status) {
        case STATUS_CONFIRMED:
            datasetLabel = "COVID-19 Confirmed cases (" + country + ")";
            title = "Confirmed cases over the las months in " + country;
            canvasId = country + "DetailCasesChart";
            break;
        case STATUS_DEATHS:
            datasetLabel = "COVID-19 Confirmed deaths (" + country + ")";
            title = "Confirmed deaths over the las months in " + country;
            canvasId = country + "DetailDeathsChart";
            break;
    }

    const ctx = document.getElementById(canvasId).getContext('2d');

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: datasetLabel,
                data: data,
                backgroundColor: countryStatusColor[country].cases,
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 16
                    }
                }
            }
        },
    });

    switch (status) {
        case STATUS_CONFIRMED:
            countryDetailsCasesCharts[country] = chart;
            break;
        case STATUS_DEATHS:
            countryDetailsDeathsCharts[country] = chart;
            break;
    }
}

function printConfirmedCountriesChart(labels, data, date) {
    const ctx = document.getElementById('topConfirmedCountriesChart').getContext('2d');
    const topConfirmedCountriesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'COVID-19 Confirmed cases / Country (' + date + ')',
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
                        size: 18
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
                label: 'COVID-19 Confirmed deaths / Country (' + date + ')',
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
                        size: 18
                    }
                }
            }
        }
    });
}
