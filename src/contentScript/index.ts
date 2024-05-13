import { createOverlayElement } from './helpers/dom'
import { IncidentData } from '../types'

// Function to process flight details when aria-expanded is true
function processFlightDetails(flightElement) {
  const flightLegs = flightElement.querySelectorAll('.c257Jb.eWArhb')

  const airlines: string[] = []
  const aircrafts: string[] = []
  const airlineIncidents: { [key: string]: IncidentData[] } = {}
  const aircraftIncidents: { [key: string]: IncidentData[] } = {}

  const incidentContainerParent = document.querySelector('div.PSZ8D.EA71Tc')
  let incidentContainer = flightElement.querySelector('.incident-container')

  if (!incidentContainer && incidentContainerParent) {
    incidentContainer = document.createElement('div')
    incidentContainer.classList.add('incident-container')
    incidentContainerParent.appendChild(incidentContainer)
  } else {
    incidentContainer.innerHTML = ''
  }

  flightLegs.forEach((flightLeg) => {
    const flightInfoElement = flightLeg.querySelector('.MX5RWe.sSHqwe.y52p7d')

    if (flightInfoElement) {
      const flightAirlineElements = flightInfoElement.querySelectorAll('.Xsgmwe')
      const airlineName = flightAirlineElements ? flightAirlineElements[1].textContent : ''
      const aircraftModel = flightAirlineElements ? flightAirlineElements[3].textContent : ''

      if (airlineName && !airlines.includes(airlineName)) {
        airlines.push(airlineName)
      }

      if (aircraftModel && !aircrafts.includes(aircraftModel)) {
        aircrafts.push(aircraftModel)
      }
    }
  })

  chrome.storage.local.get('incidentData', function (data) {
    const incidentData: IncidentData[] = data.incidentData

    airlines.forEach((airline) => {
      const airlineIncidentsData = incidentData.filter(
        (item) => item.operator && item.operator.toLowerCase().includes(airline.toLowerCase()),
      )
      airlineIncidents[airline] = airlineIncidentsData

      const lastIncident = airlineIncidentsData.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )[0]

      if (lastIncident) {
        const overlay = createOverlayElement(
          lastIncident,
          'Airline',
          airlineIncidentsData.length,
          incidentData,
        )
        incidentContainer.appendChild(overlay)
      }
    })

    aircrafts.forEach((aircraft) => {
      const aircraftIncidentsData = incidentData.filter(
        (item) => item.type && item.type.toLowerCase().includes(aircraft.toLowerCase()),
      )
      aircraftIncidents[aircraft] = aircraftIncidentsData

      const lastIncident = aircraftIncidentsData.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )[0]

      if (lastIncident) {
        const overlay = createOverlayElement(
          lastIncident,
          'Aircraft',
          aircraftIncidentsData.length,
          incidentData,
        )
        incidentContainer.appendChild(overlay)
      }
    })
  })
}

// Function to attach click event listeners to aria-expand buttons
function attachAriaExpandListeners() {
  const ariaExpandButtons = document.querySelectorAll('button[aria-expanded]')
  ariaExpandButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setTimeout(() => {
        const flightElement = button.closest('li')
        const incidentContainer = flightElement.querySelector('.incident-container')

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
  .incident-container {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 9999;

    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .incident-overlay {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 9999;
    max-width: 400px;
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
`
document.head.appendChild(style)
