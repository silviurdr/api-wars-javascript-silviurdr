
let toAddData = document.getElementById("planets-table-content");
let citizenTable = document.getElementById("citizen-table-content");
let statsTable = document.getElementById("stats-table-content");

let modalTitle = document.getElementById('modal-title')

let mainContent = document.querySelector(".main-content");

const allPlanets = []

const headerLinks = document.getElementsByClassName('header-link')

let apiLink = "https://swapi.co/api/planets/";
let nextApiLink = "";
let previousApiLink = "";

let nextButton = document.getElementById("next-button");
let previousButton = document.getElementById("previous-button");

// const audio = document.getElementsByTagName("audio")[0];

// for (headerLink of headerLinks) {
//     headerLink.addEventListener('mouseover', function () {
//         audio.play();
//     })
// }


const formatDiameter = diam => {
    let formatNum = "";
    if (parseInt(diam)) {
        if (diam.length > 3) {
            return formatNum += diam.slice(0, (diam.length - 3)) + "," + diam.slice((diam.length - 3), (diam.length)) + "km";
        } else {
            return formatNum += diam + "km";
        }
    }
    return diam;
}

const formatSurface = surface => {
    if (parseInt(surface) || surface == 0) {
        return `${surface}%`
    } else {
        return surface;
    }
}

const formatCitizenMass = mass => {
    if (parseInt(mass)) {
        return `${mass} kg`
    } else {
        return mass
    }
}

const formatCitizenHeight = height => {
    formatHeight = "";
    if (parseInt(height) && height.length == 3) {
        formatHeight += `${height.slice(0, 1)}.${height.slice(1, height.length)} m`;
    } else if (parseInt(height) && height.length == 2) {
        formatHeight += `.${height} m`;
    }
    return formatHeight;
}

const formatCitizenGender = gender => {
    if (gender == "male") {
        return `<i class="fas fa-mars male"></i>`;
    } else if (gender == "female") {
        return `<i class="fas fa-venus female"></i>`;
    } else return gender;
}

const formatPlanetPopulation = population => {
    if (parseInt(population)) {
        switch (true) {
            case (population.length < 4):
                return `${population} people`;
            case (population.length < 7 && population.length > 3):
                return `${population.slice(0, (population.length) - 3)},${population.slice((population.length - 3), population.length)} people`;
            case (population.length < 10 && population.length > 6):
                return `${population.slice(0, (population.length) - 6)},${population.slice((population.length - 6),
                    (population.length - 3))},${population.slice((population.length - 3), population.length)} people`;
            case (population.length < 13 && population.length > 9):
                return `${population.slice(0, (population.length) - 9)},${population.slice((population.length - 9),
                    (population.length - 6))},${population.slice((population.length - 6), (population.length - 3))},${population.slice((population.length - 3), population.length)} people`;
            case (population.length < 16 && population.length > 12):
                return `${population.slice(0, (population.length) - 12)},${population.slice((population.length - 12),
                    (population.length - 9))},${population.slice((population.length - 9), (population.length - 6))},${population.slice((population.length - 6),
                        (population.length - 3))},${population.slice((population.length - 3), population.length)} people`;
        }
    } else return population;
}

const formatPlanetResidents = (residents, planet) => {
    return residents.length > 0 ? `<button type="button" class="btn btn-secondary residents-button" data-planet="${
        planet["url"]}" data-planet-name="${planet["name"]}" data-toggle="modal" data-target="#citizenModal">${
        planet["residents"].length} resident(s)</button>` : 'No known residents';
}


const populatePlanetsTable = planet => {
    return `
        <tr>
            <td class="planet-name">${planet["name"]}</td>
            <td>${formatDiameter(planet["diameter"])}</td>
            <td>${planet["climate"]}</td>
            <td>${planet["terrain"]}</td>
            <td>${formatSurface(planet["surface_water"])}</td>
            <td>${formatPlanetPopulation(planet["population"])}</td>
            <td>${formatPlanetResidents(planet["residents"], planet)}</td>
            <th><a class="btn btn-secondary voting-button" name="button" href="${planet['name']}/vote" data-voted="${planet['name']}" data-voted-url="${planet['url']}">vote</a></th>
        </tr>
    `;
}

const populateResidentsModal = person => {
    return `
        <tr>
            <td class="modal-data">${person["name"]}</td>
            <td class="modal-data">${formatCitizenHeight(person["height"])}</td>
            <td class="modal-data">${formatCitizenMass(person["mass"])}</td>
            <td class="modal-data">${person["skin_color"]}</td>
            <td class="modal-data">${person["hair_color"]}</td>
            <td class="modal-data">${person["eye_color"]}</td>
            <td class="modal-data">${person["birth_year"]}</td>
            <td class="modal-data">${formatCitizenGender(person["gender"])}</td>
        </tr>
    `;
}


const populateStatsModal = (planet) => {
  return `
        <tr>
            <td class="modal-data">${planet["planet_name"]}</td>
            <td class="modal-data">${planet["voting_stats"]}</td>
        </tr>
    `;
};




nextButton.addEventListener("click", function (e) {
    if (e.detail === 1) {
        getAllPlanets(nextApiLink);
    } else if (e.detail === 2) {
        return
    }
});

previousButton.addEventListener("click", function (e) {
    if (e.detail === 1) {
        getAllPlanets(previousApiLink);
    } else if (e.detail === 2) {
        return;
    }
});


function showSpinner(spinner) {
    spinner.classList.add("show");
}


function hideSpinner(spinner) {
    spinner.classList.remove("show");
}


let votingStatsButton = document.getElementById("voting-stats-button")
votingStatsButton.addEventListener('click', async function () {
    statsTable.innerHTML = ""
    let modalContainerStats = document.querySelector(".modal-container-stats");
    modalContainerStats.classList.add('show-stats');
    $.ajax({
      type: "GET",
      url: "/voting-stats",
      success: function (result) {
          for (planet of result['vote_results']) {
              statsTable.innerHTML += populateStatsModal(planet);
          }
      },
      error: function (result) {
        alert("error");
      },
    });
})


async function getAllPlanets(source) {


    toAddData.innerHTML = "";

    let spinnerTable = document.getElementById("spinner-table");
    let modalContainer = document.querySelector(".modal-container");

    showSpinner(spinnerTable);
    let response = await fetch(source);
    let data = await response.json();
    hideSpinner(spinnerTable);
    let resultsPlanets = data.results;

    nextApiLink = data["next"];
    previousApiLink = data["previous"];

    nextButton.removeAttribute("disabled");
    if (nextApiLink == null) {
        nextButton.setAttribute("disabled", true);
    }

    previousButton.removeAttribute("disabled");
    if (previousApiLink == null) {
        previousButton.setAttribute("disabled", true);
    }
    
    for (resultsPlanet of resultsPlanets) {
        toAddData.innerHTML += populatePlanetsTable(resultsPlanet);
        registeredUser = document.querySelector(".member-message");
        voteButtonsStatus = document.querySelectorAll(".voting-button");
        if (registeredUser == null) {
            for (voteButtonStatus of voteButtonsStatus)
                voteButtonStatus.classList.add("hide-vote-button");
        }
        allPlanets.push(resultsPlanet['url']);
        let votingButtons = document.getElementsByClassName("voting-button");

        for (votingButton of votingButtons) {
            votingButton.addEventListener("click", function (e) {
                e.preventDefault();
                let planetVoted = event.target.dataset.voted;
                let planetVotedURL = event.target.dataset.votedUrl;
                $.ajax({
                  type: "POST",
                  url: `/${planetVoted}/vote`,
                    data: {
                        'planet_name': planetVoted,
                        'url': planetVotedURL
                    },
                  success: function (result) {
                    alert(`You voted ${planetVoted}!`);
                  },
                  error: function (result) {
                    alert("error");
                  },
                });
            });
        }
    }


    let citizenButtons = document.getElementsByClassName("residents-button");
    for (citizenButton of citizenButtons) {
        citizenButton.addEventListener('click', async function () {
            let spinnerModal = document.getElementById("spinner-modal");
            showSpinner(spinnerModal);
            modalContainer.classList.remove("show-citizens");
            modalTitle.textContent = "";
            citizenTable.innerHTML = "";
            modalTitle.textContent += `Residents of ${event.target.dataset.planetName}`;
            let residentsModalData = await fetch(event.target.dataset.planet).
                then((response) => response.json()).
                then((responseJson) => {
                    return responseJson;
                })
            let residentNames = residentsModalData['residents'];
            for (residentName of residentNames) {
                let resultResident = await fetch(residentName);
                let residentData = await resultResident.json();
                citizenTable.innerHTML += populateResidentsModal(residentData)
            }
            hideSpinner(spinnerModal);

            modalContainer.classList.add("show-citizens");
        })
    }
};

getAllPlanets(apiLink);
