// contentScript/index.ts
import { createOverlayElement } from './helpers/dom'
import { IncidentData } from '../types'

// Function to process flight details when aria-expanded is true
async function processFlightDetails(flightElement: Element) {
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

  flightLegs.forEach((flightLeg: any) => {
    const flightInfoElement = flightLeg.querySelector('.MX5RWe.sSHqwe.y52p7d')

    if (flightInfoElement) {
      const flightAirlineElements = flightInfoElement.querySelectorAll('.Xsgmwe')

      console.log('flightAirlineElements', flightAirlineElements)

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

  console.log('airlines', airlines)
  console.log('aircrafts', aircrafts)

  // Fetch the latest fatal incidents by airline and aircraft
  await Promise.all([
    new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { action: 'fetchLatestFatalIncidentByAirline', airline: airlines[0] },
        (response) => {
          resolve(response.incident)
        },
      )
    }),
    new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { action: 'fetchLatestFatalIncidentByAircraft', aircraft: aircrafts[0] },
        (response) => {
          resolve(response.incident)
        },
      )
    }),
  ])
    .then(([lastAirlineIncident, lastAircraftIncident]: any) => {
      console.log('lastAirlineIncident', lastAirlineIncident)
      console.log('lastAircraftIncident', lastAircraftIncident)

      if (lastAirlineIncident) {
        const overlay = createOverlayElement(lastAirlineIncident, 'Airline')
        incidentContainer?.appendChild(overlay)
      }

      if (lastAircraftIncident) {
        const overlay = createOverlayElement(lastAircraftIncident, 'Aircraft')
        incidentContainer?.appendChild(overlay)
      }
    })
    .catch((error) => {
      console.error('Error fetching incident data:', error)
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
  .incident-overlay {
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 9999;
    max-width: 300px;
    width: 100%;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .incident-card-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .incident-card {
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .incident-info {
    background-color: #f0f0f0;
  }
  
  .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  
  .info-item {
    flex: 1;
  }
  
  .incident-card h2,
  .incident-card h3 {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  .incident-card p {
    margin-bottom: 5px;
  }
  
  .emoji {
    font-size: 24px;
    margin-right: 5px;
  }
  
  .high-risk {
    background-color: #ffe7e7;
    color: #d32f2f;
  }

  .total-incidents {
    background-color: #f0f0f0;
  }
  
  .medium-risk {
    background-color: #fff3e0;
    color: #ff9800;
  }  
  
  .low-risk {
    background-color: #e7f5e7;
    color: #388e3c;
  }
  
  .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 24px;
    background: none;
    color: #333;
    border: none;
    cursor: pointer;
  }
  
  .tab-container {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }
  
  .tab {
    padding: 10px 20px;
    background-color: #f0f0f0;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .tab:hover {
    background-color: #e0e0e0;
  }
  
  .tab.active {
    background-color: #ddd;
  }
  
  .tab-content {
    display: none;
  }
  
  .tab-content.active {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  @media screen and (max-width: 600px) {
    .incident-overlay {
      max-width: 90%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
`
document.head.appendChild(style)
