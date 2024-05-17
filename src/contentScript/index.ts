// contentScript/index.ts
import { ServerIncidentData, UIIncidentData } from '../types'
import { createLoadingElement, createOverlayElement } from './helpers/dom'

// Function to process flight details when aria-expanded is true
async function processFlightDetails(flightElement: any) {
  const flightLegs = flightElement.querySelectorAll('.c257Jb.eWArhb')

  const airlines: string[] = []
  const aircrafts: string[] = []

  const incidentContainerParent = document.querySelector('div.PSZ8D.EA71Tc')
  let incidentContainer = flightElement.querySelector('.incident-container')

  if (!incidentContainer && incidentContainerParent) {
    incidentContainer = document.createElement('div')
    incidentContainer.classList.add('incident-container')
    incidentContainerParent.appendChild(incidentContainer)
  } else if (incidentContainer) {
    incidentContainer.innerHTML = ''
  }

  const overlayLoading = createLoadingElement()
  incidentContainer?.appendChild(overlayLoading)

  flightLegs.forEach((flightLeg: Element) => {
    const flightInfoElement = flightLeg.querySelector('.MX5RWe.sSHqwe.y52p7d')

    if (flightInfoElement) {
      const flightAirlineElements = flightInfoElement.querySelectorAll('.Xsgmwe')

      const airlineName = flightAirlineElements ? flightAirlineElements[0].textContent : ''
      const aircraftModel = flightAirlineElements ? flightAirlineElements[3].textContent : ''

      if (airlineName && !airlines.includes(airlineName)) {
        airlines.push(airlineName)
      }

      if (aircraftModel && !aircrafts.includes(aircraftModel)) {
        aircrafts.push(aircraftModel)
      }
    }
  })

  const incidents: UIIncidentData[] = []

  await Promise.all([
    ...airlines.map(
      (airline) =>
        new Promise<void>((resolve) => {
          chrome.runtime.sendMessage(
            { action: 'fetchLatestFatalIncidentByAirline', airline },
            (response) => {
              incidents.push({
                type: 'Airline',
                airline,
                date: response.incident.date,
                fatalities: response.incident.fatalities,
                location: response.incident.location,
                daysSinceLastIncident: Math.floor(
                  (new Date().getTime() - new Date(response.incident.date).getTime()) /
                    (1000 * 3600 * 24),
                ),
              })
              overlayLoading.remove()

              resolve()
            },
          )
        }),
    ),
    ...aircrafts.map(
      (aircraft) =>
        new Promise<void>((resolve) => {
          chrome.runtime.sendMessage(
            { action: 'fetchLatestFatalIncidentByAircraft', aircraft },
            (response) => {
              incidents.push({
                type: 'Aircraft',
                aircraft,
                date: response.incident.date,
                fatalities: response.incident.fatalities,
                location: response.incident.location,
                daysSinceLastIncident: Math.floor(
                  (new Date().getTime() - new Date(response.incident.date).getTime()) /
                    (1000 * 3600 * 24),
                ),
              })
              overlayLoading.remove()

              resolve()
            },
          )
        }),
    ),
  ])
    .then(() => {
      overlayLoading.remove()
      const overlay = createOverlayElement(incidents)
      incidentContainer?.appendChild(overlay)
    })
    .catch((error) => {
      console.error('Error fetching incident data:', error)
      overlayLoading.remove()
    })
}

// Function to attach click event listeners to aria-expand buttons
function attachAriaExpandListeners() {
  const ariaExpandButtons = document.querySelectorAll('button[aria-expanded]')
  ariaExpandButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setTimeout(() => {
        const flightElement = button.closest('li')
        const incidentContainer = flightElement?.querySelector('.incident-container')

        if (button.getAttribute('aria-expanded') === 'true') {
          if (flightElement) {
            processFlightDetails(flightElement)
          }
        } else {
          if (incidentContainer) {
            incidentContainer.remove()
          }
        }
      }, 0)
    })
  })
}

// Function to process flight elements and overlay incident data
function processFlights() {
  console.log('Processing flights...')

  // Attach click event listeners to aria-expand buttons
  attachAriaExpandListeners()
}

if (document.readyState !== 'complete') {
  window.addEventListener('load', afterWindowLoaded)
} else {
  afterWindowLoaded()
}

function afterWindowLoaded() {
  // Use a MutationObserver to detect when the h3 elements are added to the DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        const addedNodes = mutation.addedNodes
        for (const node of addedNodes) {
          // @ts-ignore
          if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'H3') {
            processFlights()
            break
          }
        }
      }
    })
  })

  // Configure the observer to watch for changes in the entire document body
  const config = { childList: true, subtree: true }
  observer.observe(document.body, config)

  // Call processFlights initially in case the h3 elements are already present
  processFlights()
}

// Inject CSS styles into the page
const style = document.createElement('style')
style.textContent = `
/* Base styles */
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.incident-overlay {
  position: fixed;
  bottom: 10px;
  right: 10px;
  z-index: 9999;
  max-width: 400px;
  width: 100%;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 10px;
  border: none;
  overflow-y: auto;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
  color: #333;
  transition: all 0.3s ease;
}

.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  font-size: 18px;
  font-weight: bold;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #219EBC;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin-right: 10px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.incident-card-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tab {
  padding: 10px 20px;
  background-color: #8ECAE6;
  border: 1px solid #219EBC;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
  color: #fff;
}

.tab:hover {
  background-color: #219EBC;
}

.tab.active {
  background-color: #023047;
  border-color: #023047;
  color: #fff;
}

.tab-content {
  display: none;
}

.tab-content.active {
  display: block;
}

.incident-card {
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
}

.incident-info {
  background-color: #f0f0f0;
  border: 1px solid #d0d0d0;
  border-radius: 10px;
  padding: 10px;
}

.info-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 10px;
}

.info-item {
  flex: 1;
  margin: 0 0 5px 5px;
}

.incident-card h2,
.incident-card h3 {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

.incident-card p {
  margin-bottom: 5px;
}

.high-risk {
  background-color: #ffebee;
  color: #d32f2f;
}

.medium-risk {
  background-color: #fff8e1;
  color: #ff9800;
}

.low-risk {
  background-color: #e8f5e9;
  color: #388e3c;
}

.close-button {
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 20px;
  background: none;
  color: #333;
  border: none;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-button:hover {
  color: #d32f2f;
}

@media screen and (max-width: 600px) {
  .incident-overlay {
    max-width: 90%;
    bottom: 50%;
    left: 50%;
    transform: translate(-50%, 50%);
  }
}

`
document.head.appendChild(style)
