import { extractDetailUsingXPath, findFlightOptionsContainer } from './helpers/dom'

// Function to process flight details when aria-expanded is true
function processFlightDetails(flightElement) {
  const flightLegs = flightElement.querySelectorAll('.c257Jb.eWArhb')

  flightLegs.forEach((flightLeg) => {
    const flightInfoElement = flightLeg.querySelector('.MX5RWe.sSHqwe.y52p7d')
    if (flightInfoElement) {
      console.log('Flight Info Element:', flightInfoElement)

      const flightAirlineElements = flightInfoElement.querySelectorAll('.Xsgmwe')

      console.log('Flight Airline Elements:', flightAirlineElements)

      const airlineName = flightAirlineElements ? flightAirlineElements[1].textContent : ''

      console.log('Airline Name:', airlineName)

      const aircraftModel = flightAirlineElements ? flightAirlineElements[3].textContent : ''

      console.log('Aircraft Model:', aircraftModel)

      // Perform any other actions specific to the aircraft model
      // ...
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

  const bestFlightsContainer = findFlightOptionsContainer('Best')
  const otherFlightsContainer = findFlightOptionsContainer('Other')

  const flightContainers = [bestFlightsContainer, otherFlightsContainer]

  console.log('Flight containers:', flightContainers)

  flightContainers.forEach((flightContainer) => {
    if (flightContainer) {
      const flightElements = flightContainer.querySelectorAll('li')

      console.log('Processing flights...', flightElements.length)

      flightElements.forEach((flight) => {
        console.log('Processing flight:', flight)

        // Find the div element with the aria-label attribute within the flight li
        const flightDetailsDiv = flight.querySelector('div[aria-label]')

        console.log('Flight details div:', flightDetailsDiv)

        if (flightDetailsDiv) {
          const flightDetailsLabel = flightDetailsDiv.getAttribute('aria-label')
          console.log('Flight details label:', flightDetailsLabel)

          // TODO: Extract airline name and aircraft model from the flight details label

          // if (airlineName || aircraftModel) {
          //   // Retrieve incident data from Chrome storage
          //   chrome.storage.local.get('incidentData', function (data) {
          //     const incidentData = data.incidentData;

          //     // Find the relevant incident data based on airline and aircraft model
          //     const incident = incidentData.find(
          //       (item) =>
          //         item.operator.toLowerCase().includes(airlineName.toLowerCase()) ||
          //         item.type.toLowerCase().includes(aircraftModel.toLowerCase())
          //     );

          //     console.log('Incident:', incident);

          //     if (incident) {
          //       const overlayElement = createOverlayElement(incident);
          //       flight.appendChild(overlayElement);
          //     }
          //   });
          // }
        }
      })
    }
  })

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
