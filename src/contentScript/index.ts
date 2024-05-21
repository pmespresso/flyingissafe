import { AllData } from "../types";
import { fetchMostRecentFatalIncidentsByAircraft, fetchMostRecentFatalIncidentsByAirline, getRiskLevel } from "./api";

function readJourneyDetails(flightElement: Element) {
    const flightLegs = flightElement.querySelectorAll('.c257Jb.eWArhb');

    const airlinesInTheJourney: string[] = [];
    const aircraftsInTheJourney: string[] = [];

    flightLegs.forEach((flightLeg: Element) => {
        const flightInfoElement = flightLeg.querySelector('.MX5RWe.sSHqwe.y52p7d');
        if (!flightInfoElement) return;

        const flightAirlineElements = flightInfoElement.querySelectorAll('.Xsgmwe');
        const airlineName = flightAirlineElements[0]?.textContent || '';
        const aircraftModel = flightAirlineElements[3]?.textContent || '';

        if (airlineName && !airlinesInTheJourney.includes(airlineName)) {
            airlinesInTheJourney.push(airlineName);
        }

        if (aircraftModel && !aircraftsInTheJourney.includes(aircraftModel)) {
            aircraftsInTheJourney.push(aircraftModel);
        }
    });

    return { airlinesInTheJourney, aircraftsInTheJourney };
}

async function attachActionButtons(flightElement: Element) {
    const flightInfoElement = flightElement.querySelector('.MX5RWe.sSHqwe.y52p7d');
    if (!flightInfoElement) return;

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('incident-button-container');

    const actionButton = document.createElement('button');
    actionButton.textContent = 'Get Incident Data';
    actionButton.classList.add('get-incident-data');
    actionButton.addEventListener('click', async () => {
        const { airlinesInTheJourney, aircraftsInTheJourney } = readJourneyDetails(flightElement);
        await getIncidentData(airlinesInTheJourney, aircraftsInTheJourney);
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

    flightInfoElement.appendChild(buttonContainer);

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && !flightInfoElement.querySelector('.incident-button-container')) {
                flightInfoElement.appendChild(buttonContainer);
            }
        });
    });

    observer.observe(flightInfoElement, { childList: true, subtree: true });
}

async function getIncidentData(airlinesInTheJourney: string[], aircraftsInTheJourney: string[]) {
    const [airlineIncidents, aircraftIncidents, riskLevelData] = await Promise.all([
        Promise.all(airlinesInTheJourney.map(fetchMostRecentFatalIncidentsByAirline)),
        Promise.all(aircraftsInTheJourney.map(fetchMostRecentFatalIncidentsByAircraft)),
        await getRiskLevel(airlinesInTheJourney, aircraftsInTheJourney)
    ]);

    console.log('Airline Incidents:', airlineIncidents);
    console.log('Aircraft Incidents:', aircraftIncidents);
    console.log('Risk Level Data:', riskLevelData);

    const allIncidentData: AllData = {
        airlineIncidents: airlineIncidents.flat(),
        aircraftIncidents: aircraftIncidents.flat(),
        airlinesInTheJourney,
        aircraftsInTheJourney,
        riskScore: null, 
        riskLevel: null
    };

    if (!riskLevelData) {
        console.error('Error getting risk level data');
        chrome.runtime.sendMessage({ type: 'setIncidentData', data: allIncidentData });
        return allIncidentData
    }

    const { riskScore, riskLevel } = riskLevelData;

    allIncidentData.riskScore = riskScore;
    allIncidentData.riskLevel = riskLevel;

    chrome.runtime.sendMessage({ type: 'setIncidentData', data: allIncidentData });

    return allIncidentData;
}

function attachAriaExpandListeners() {
    document.querySelectorAll('button[aria-expanded]').forEach((button) => {
        button.addEventListener('click', () => {
            setTimeout(() => {
                const flightElement = button.closest('li');
                if (button.getAttribute('aria-expanded') === 'true') {
                    flightElement && attachActionButtons(flightElement);
                } else {
                    flightElement?.querySelector('.incident-container')?.remove();
                }
            }, 100);
        });
    });
}

function init() {
    const observer = new MutationObserver((mutations) => {
        // @ts-ignore
        if (mutations.some(mutation => Array.from(mutation.addedNodes).some(node => node.nodeType === Node.ELEMENT_NODE && node.tagName === 'H3'))) {
            attachAriaExpandListeners();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    attachAriaExpandListeners();
}

document.readyState === 'complete' ? init() : window.addEventListener('load', init);