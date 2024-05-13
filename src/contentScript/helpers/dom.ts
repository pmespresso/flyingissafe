import { IncidentData } from '../../types'

// Function to create an overlay element
export function createOverlayElement(
  incident: IncidentData,
  incidentType: string,
  totalIncidents: number,
  incidentData: IncidentData[],
) {
  const overlay = document.createElement('div')
  overlay.classList.add('incident-overlay')

  const currentYear = new Date().getFullYear()

  const validIncidentYears = incidentData
    .map((incident) => {
      const incidentDate = new Date(incident.date)
      return isNaN(incidentDate.getTime()) ? null : incidentDate.getFullYear()
    })
    .filter((year) => year !== null)

  const earliestIncidentYear =
    validIncidentYears.length > 0 ? Math.min(...validIncidentYears) : currentYear

  const airlineIncidents = incidentData.filter((i) => i.operator === incident.operator)
  const airlineIncidentRate = airlineIncidents.length / (currentYear - earliestIncidentYear)
  const lastAirlineIncidentDate = new Date(
    Math.max(...airlineIncidents.map((i) => new Date(i.date).getTime())),
  )
  const timeSinceLastAirlineIncident = Math.floor(
    (new Date().getTime() - lastAirlineIncidentDate.getTime()) / (1000 * 3600 * 24),
  )
  const lastFatalAirlineIncident = airlineIncidents
    .filter((i) => i.fatalities > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
  const timeSinceLastFatalAirlineIncident = lastFatalAirlineIncident
    ? Math.floor(
        (new Date().getTime() - new Date(lastFatalAirlineIncident.date).getTime()) /
          (1000 * 3600 * 24),
      )
    : null

  const aircraftIncidents = incidentData.filter((i) => i.type === incident.type)
  const aircraftIncidentRate = aircraftIncidents.length / (currentYear - earliestIncidentYear)
  const lastAircraftIncidentDate = new Date(
    Math.max(...aircraftIncidents.map((i) => new Date(i.date).getTime())),
  )
  const timeSinceLastAircraftIncident = Math.floor(
    (new Date().getTime() - lastAircraftIncidentDate.getTime()) / (1000 * 3600 * 24),
  )
  const lastFatalAircraftIncident = aircraftIncidents
    .filter((i) => i.fatalities > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
  const timeSinceLastFatalAircraftIncident = lastFatalAircraftIncident
    ? Math.floor(
        (new Date().getTime() - new Date(lastFatalAircraftIncident.date).getTime()) /
          (1000 * 3600 * 24),
      )
    : null

  overlay.innerHTML = `
    <div class="incident-card-container">
      <button class="close-button">×</button>
      <div class="incident-card incident-info">
        <h2><span class="emoji">✈️</span> Incident Information</h2>
        <div class="info-row">
          <div class="info-item">
            <strong>Airline:</strong>
            <p>${incident.operator}</p>
          </div>
          <div class="info-item">
            <strong>Aircraft:</strong>
            <p>${incident.type}</p>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <strong>Last Incident:</strong>
            <p>${incident.date}</p>
          </div>
          <div class="info-item">
            <strong>Fatalities:</strong>
            <p>${incident.fatalities}</p>
          </div>
        </div>
      </div>
      <div class="tab-container">
        <div class="tab active" data-tab="airline">Airline</div>
        <div class="tab" data-tab="aircraft">Aircraft</div>
      </div>
      <div class="tab-content active" id="airline">
        <div class="incident-card incident-rate ${airlineIncidentRate > 1 ? 'high-risk' : 'low-risk'}">
          <h3><span class="emoji">📈</span> ${incident.operator} Incident Rate</h3>
          <p>${airlineIncidentRate.toFixed(2)} incidents per year</p>
        </div>
        <div class="incident-card time-since-incident ${timeSinceLastAirlineIncident > 365 ? 'low-risk' : 'high-risk'}">
          <h3><span class="emoji">⏳</span> Time Since Last ${incident.operator} Incident</h3>
          <p>${timeSinceLastAirlineIncident} days</p>
        </div>
        ${
          timeSinceLastFatalAirlineIncident !== null
            ? `<div class="incident-card time-since-fatal ${timeSinceLastFatalAirlineIncident > 365 ? 'low-risk' : 'high-risk'}">
                 <h3><span class="emoji">💀</span> Time Since Last Fatal ${incident.operator} Incident</h3>
                 <p>${timeSinceLastFatalAirlineIncident} days</p>
               </div>`
            : ''
        }
      </div>
      <div class="tab-content" id="aircraft">
        <div class="incident-card incident-rate ${aircraftIncidentRate > 1 ? 'high-risk' : 'low-risk'}">
          <h3><span class="emoji">📈</span> ${incident.type} Incident Rate</h3>
          <p>${aircraftIncidentRate.toFixed(2)} incidents per year</p>
        </div>
        <div class="incident-card time-since-incident ${timeSinceLastAircraftIncident > 365 ? 'low-risk' : 'high-risk'}">
          <h3><span class="emoji">⏳</span> Time Since Last ${incident.type} Incident</h3>
          <p>${timeSinceLastAircraftIncident} days</p>
        </div>
        ${
          timeSinceLastFatalAircraftIncident !== null
            ? `<div class="incident-card time-since-fatal ${timeSinceLastFatalAircraftIncident > 365 ? 'low-risk' : 'high-risk'}">
                 <h3><span class="emoji">💀</span> Time Since Last Fatal ${incident.type} Incident</h3>
                 <p>${timeSinceLastFatalAircraftIncident} days</p>
               </div>`
            : ''
        }
      </div>
    </div>
  `

  const closeButton = overlay.querySelector('.close-button')
  closeButton.addEventListener('click', () => {
    overlay.remove()
  })

  const tabs = overlay.querySelectorAll('.tab')
  const tabContents = overlay.querySelectorAll('.tab-content')

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab')
      tabs.forEach((t) => t.classList.remove('active'))
      tabContents.forEach((content) => content.classList.remove('active'))
      tab.classList.add('active')
      overlay.querySelector(`#${tabId}`).classList.add('active')
    })
  })

  return overlay
}
