import { IncidentData, createOverlayElement } from './helpers/dom'

// Function to process flight details when aria-expanded is true
function processFlightDetails(flightElement) {
  const flightLegs = flightElement.querySelectorAll('.c257Jb.eWArhb')

  const airlines: string[] = []
  const aircrafts: string[] = []
  const airlineIncidents: { [key: string]: IncidentData } = {}
  const aircraftIncidents: { [key: string]: IncidentData } = {}
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

      const incidentContainerParent = document.querySelector('div.PSZ8D.EA71Tc')

      console.log('incidentContainerParent', incidentContainerParent)

      // Check if the incident container already exists
      let incidentContainer = flightInfoElement.querySelector('.incident-container')
      if (!incidentContainer && incidentContainerParent) {
        incidentContainer = document.createElement('div')
        incidentContainer.classList.add('incident-container')
        incidentContainerParent.appendChild(incidentContainer)
      } else {
        // Clear the existing incident container
        incidentContainer.innerHTML = ''
      }

      // Retrieve incident data from Chrome storage
      chrome.storage.local.get('incidentData', function (data) {
        const incidentData: IncidentData[] = data.incidentData

        airlines.forEach((airline) => {
          const lastIncident = incidentData
            .filter(
              (item) =>
                item.operator && item.operator.toLowerCase().includes(airline.toLowerCase()),
            )
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

          if (lastIncident) {
            airlineIncidents[airline] = lastIncident

            const overlay = createOverlayElement([lastIncident], 'Airline')
            incidentContainer.appendChild(overlay)
          }
        })

        aircrafts.forEach((aircraft) => {
          const lastIncident = incidentData
            .filter((item) => item.type && item.type.toLowerCase().includes(aircraft.toLowerCase()))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

          if (lastIncident) {
            aircraftIncidents[aircraft] = lastIncident

            const overlay = createOverlayElement([lastIncident], 'Aircraft')
            incidentContainer.appendChild(overlay)
          }
        })
      })
    }
  })
}

// Function to attach click event listeners to aria-expand buttons
function attachAriaExpandListeners() {
  const ariaExpandButtons = document.querySelectorAll('button[aria-expanded]')
  ariaExpandButtons.forEach((button) => {
    button.addEventListener('click', () => {
      // Wait for the aria-expanded attribute to be updated
      setTimeout(() => {
        if (button.getAttribute('aria-expanded') === 'true') {
          const flightElement = button.closest('li')
          if (flightElement) {
            processFlightDetails(flightElement)
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
    position: absolute;
    top: 0;
    right: 0;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .incident-card {
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 10px;
    font-size: 14px;
    width: 300px;
  }

  .incident-header {
    background-color: #f44336;
    color: #fff;
    padding: 10px;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
  }

  .incident-body {
    padding: 10px;
  }

  .no-incident-data {
    color: #888;
    font-size: 12px;
    margin-top: 5px;
  }
`
document.head.appendChild(style)
