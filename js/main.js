var casesList;
var countries = new Array();

fetch("https://covid-api.mmediagroup.fr/v1/cases")
    .then((response) => response.json())
    .then((data) => {
        // Iterate the retrieved object.
        Object.keys(data).map((key) => {
            // Each element is an object containing another object containing the data.
            // Insert the data of the innermost object in an array.
            let dataKey = Object.keys(data[key])[0];
            countries.push(data[key][dataKey]);

            if (!countries[countries.length - 1].country) {
                countries[countries.length - 1].country = key;
                console.log(countries.length - 1 + " - " + key);
            }
        });

        console.log(countries);

        casesList = document.getElementById("list");

        countries.forEach((country) => {
            let listElement;

            listElement = document.createElement("li");
            listElement.innerHTML = country.country + " - " + country.confirmed;

            casesList.appendChild(listElement);
        })
    });
