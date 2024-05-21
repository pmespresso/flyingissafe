// content script
import { AllData, FlightLeg } from "../types";
import { fetchMostRecentFatalIncidentsByAircraft, fetchMostRecentFatalIncidentsByAirline, getRiskLevel } from "./api";

function readJourneyDetails(flightElement: Element): FlightLeg[] {
    const flightLegs = flightElement.querySelectorAll('.c257Jb.eWArhb');

    const journeyDetails: FlightLeg[] = [];

    flightLegs.forEach((flightLeg: Element) => {
        const flightInfoElement = flightLeg.querySelector('.MX5RWe.sSHqwe.y52p7d');
        if (!flightInfoElement) return;

        const flightAirlineElements = flightInfoElement.querySelectorAll('.Xsgmwe');
        const airlineName = flightAirlineElements[0]?.textContent || '';
        const aircraftModel = flightAirlineElements[3]?.textContent || '';

        if (airlineName && aircraftModel) {
            journeyDetails.push({
                airline: airlineName,
                aircraft: aircraftModel,
                aircraftIncidents: [],
                airlineIncidents: []
            });
        }
    });

    console.log(" === Journey Details === ")
    console.log('Journey Details:', journeyDetails);

    return journeyDetails;
}
async function getIncidentData(journeyDetails: FlightLeg[]) {
    const airlineIncidents = await Promise.all(journeyDetails.map(leg => fetchMostRecentFatalIncidentsByAirline(leg.airline)));
    const aircraftIncidents = await Promise.all(journeyDetails.map(leg => fetchMostRecentFatalIncidentsByAircraft(leg.aircraft)));
    const riskLevelData = await getRiskLevel(journeyDetails.map(leg => leg.airline), journeyDetails.map(leg => leg.aircraft));
  
    journeyDetails.forEach((leg, index) => {
      leg.airlineIncidents = airlineIncidents[index];
      leg.aircraftIncidents = aircraftIncidents[index];
    });
  
    console.log('Journey Details with Incidents:', journeyDetails);
    console.log('Risk Level Data:', riskLevelData);
  
    const allIncidentData: AllData = {
      journeyDetails,
      riskScore: riskLevelData ? riskLevelData.riskScore : null,
      riskLevel: riskLevelData ? riskLevelData.riskLevel : null
    };
  
    chrome.runtime.sendMessage({ type: 'setIncidentData', data: allIncidentData });
  
    return allIncidentData;
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
        const journeyDetails = readJourneyDetails(flightElement);
        await getIncidentData(journeyDetails);
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