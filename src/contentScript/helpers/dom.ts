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

  const aircraftIncidents = incidentData.filter((i) => i.type === incident.type)
  const aircraftIncident = aircraftIncidents.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )[0]
  const totalAircraftIncidents = aircraftIncidents.length
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

  const airlineIncidents = incidentData.filter((i) => i.operator === incident.operator)
  const airlineIncident = airlineIncidents.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )[0]
  const totalAirlineIncidents = airlineIncidents.length
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
      </div>
      <div class="tab-container">
        <div class="tab active" data-tab="airline">Airline</div>
        <div class="tab" data-tab="aircraft">Aircraft</div>
      </div>
      <div class="tab-content active" id="airline">
        <div class="incident-card incident-info">
          <p class="incident-reason">The following incident is being shown because your selected flight involves the same airline (${incident.operator}) as the incident.</p>
          <div class="info-row">
            <div class="info-item">
              <strong>Last Incident:</strong>
              <p>${airlineIncident.date}</p>
            </div>
            <div class="info-item">
              <strong>Fatalities:</strong>
              <p>${airlineIncident.fatalities}</p>
            </div>
          </div>
        </div>
        <div class="incident-card total-incidents">
          <h3><span class="emoji">📊</span> Total ${incident.operator} Incidents Since 1919</h3>
          <p>${totalAirlineIncidents} incidents</p>
        </div>
        <div class="incident-card time-since-incident ${timeSinceLastAirlineIncident > 365 ? 'low-risk' : 'medium-risk'}">
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
        <div class="incident-card incident-info">
          <p class="incident-reason">The following incident is being shown because your selected flight involves the same aircraft (${incident.type}) as the incident.</p>
          <div class="info-row">
            <div class="info-item">
              <strong>Last Incident:</strong>
              <p>${aircraftIncident.date}</p>
            </div>
            <div class="info-item">
              <strong>Fatalities:</strong>
              <p>${aircraftIncident.fatalities}</p>
            </div>
          </div>
        </div>
        <div class="incident-card total-incidents">
          <h3><span class="emoji">📊</span> Total ${incident.type} Incidents Since 1919</h3>
          <p>${totalAircraftIncidents} incidents</p>
        </div>
        <div class="incident-card time-since-incident ${timeSinceLastAircraftIncident > 365 ? 'low-risk' : 'medium-risk'}">
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

      <small>Source: <a href="https://aviation-safety.net">https://aviation-safety.net</a></small>
      <small>If you notice an error, please report the issue <a href="mailto:yj@lasalida.io">here</small>
    </div>
  `

  const closeButton = overlay.querySelector('.close-button')
  closeButton?.addEventListener('click', () => {
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
      // @ts-ignore
      overlay.querySelector(`#${tabId}`).classList.add('active')
    })
  })

  return overlay
}
