import { fetchMostRecentIncidentsByAircraft, fetchMostRecentIncidentsByAirline } from "./api";

// This function will be executed in the context of the Google Flights page
// A "Journey" refers to the entire set of flights that comprise a trip from point A to point Z through connecting flights
// It will extract the airlines and aircrafts of each flight leg in the journey
function readJourneyDetails(flightElement: Element) {
    console.log('readJourneyDetails', flightElement);
    const flightLegs = flightElement.querySelectorAll('.c257Jb.eWArhb');

    const airlinesInTheJourney: string[] = [];
    const aircraftsInTheJourney: string[] = [];

    flightLegs.forEach((flightLeg: Element) => {
        const flightInfoElement = flightLeg.querySelector('.MX5RWe.sSHqwe.y52p7d');

        if (flightInfoElement) {
            const flightAirlineElements = flightInfoElement.querySelectorAll('.Xsgmwe');

            const airlineName = flightAirlineElements ? flightAirlineElements[0].textContent : '';
            const aircraftModel = flightAirlineElements ? flightAirlineElements[3].textContent : '';

            if (airlineName && !airlinesInTheJourney.includes(airlineName)) {
                airlinesInTheJourney.push(airlineName);
            }

            if (aircraftModel && !aircraftsInTheJourney.includes(aircraftModel)) {
                aircraftsInTheJourney.push(aircraftModel);
            }
        }
    });

    console.log("airlinesInTheJourney", airlinesInTheJourney);
    console.log("aircraftsInTheJourney", aircraftsInTheJourney);

    return { airlinesInTheJourney, aircraftsInTheJourney };
}

async function attachActionButtons(flightElement: Element) {
    console.log('attachActionButtons', flightElement);
    const flightInfoElement = flightElement.querySelector('.MX5RWe.sSHqwe.y52p7d');

    console.log("flightInfoElement", flightInfoElement);
    if (!flightInfoElement) return;

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('incident-button-container');

    const actionButton = document.createElement('button');
    actionButton.textContent = 'Get Incident Data';
    actionButton.classList.add('get-incident-data');
    actionButton.addEventListener('click', async () => {
        const { airlinesInTheJourney, aircraftsInTheJourney } = readJourneyDetails(flightElement);
        const incidentData = await getIncidentData(airlinesInTheJourney, aircraftsInTheJourney);

        console.log(incidentData);
    });

    buttonContainer.appendChild(actionButton);

    const style = document.createElement('style');

    style.textContent = `
        .get-incident-data {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 5px;
            margin-top: 10px;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);

    console.log("buttonContainer", buttonContainer);

    flightInfoElement.appendChild(buttonContainer);

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                const buttonContainerExists = flightInfoElement.querySelector('.incident-button-container');
                if (!buttonContainerExists) {
                    flightInfoElement.appendChild(buttonContainer);
                }
            }
        });
    });

    const config = { childList: true, subtree: true };
    observer.observe(flightInfoElement, config);
}

async function getIncidentData(airlinesInTheJourney: string[], aircraftsInTheJourney: string[]) {
    const airlineIncidents = await Promise.all(airlinesInTheJourney.map(fetchMostRecentIncidentsByAirline));
    const aircraftIncidents = await Promise.all(aircraftsInTheJourney.map(fetchMostRecentIncidentsByAircraft));

    console.log("airlineIncidents", airlineIncidents);
    console.log("aircraftIncidents", aircraftIncidents);

    return { airlineIncidents, aircraftIncidents };
}

// Function to attach click event listeners to aria-expand buttons
function attachAriaExpandListeners() {
    const ariaExpandButtons = document.querySelectorAll('button[aria-expanded]');
    ariaExpandButtons.forEach((button) => {
        button.addEventListener('click', () => {
            setTimeout(() => {
                const flightElement = button.closest('li');
                const incidentContainer = flightElement?.querySelector('.incident-container');

                if (button.getAttribute('aria-expanded') === 'true') {
                    if (flightElement) {
                        attachActionButtons(flightElement);
                    }
                } else {
                    if (incidentContainer) {
                        incidentContainer.remove();
                    }
                }
            }, 100); // Increased timeout duration
        });
    });
}

if (document.readyState !== 'complete') {
    window.addEventListener('load', afterWindowLoaded);
} else {
    afterWindowLoaded();
}

function afterWindowLoaded() {
    // Use a MutationObserver to detect when the h3 elements are added to the DOM
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                const addedNodes = mutation.addedNodes;
                for (const node of addedNodes) {
                    // @ts-ignore
                    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'H3') {
                        attachAriaExpandListeners();
                        break;
                    }
                }
            }
        });
    });

    // Configure the observer to watch for changes in the entire document body
    const config = { childList: true, subtree: true };
    observer.observe(document.body, config);

    attachAriaExpandListeners();
}
