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
  const earliestIncidentYear = Math.min(
    ...incidentData.map((incident) => new Date(incident.date).getFullYear()),
  )
  const incidentRate = totalIncidents / (currentYear - earliestIncidentYear)

  const lastIncidentDate = new Date(incident.date)
  const currentDate = new Date()
  const timeSinceLastIncident = Math.floor(
    (currentDate.getTime() - lastIncidentDate.getTime()) / (1000 * 3600 * 24),
  )

  const fatalIncidents = incidentData.filter((incident) => incident.fatalities > 0)
  const lastFatalIncident = fatalIncidents.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )[0]
  const timeSinceLastFatalIncident = lastFatalIncident
    ? Math.floor(
        (currentDate.getTime() - new Date(lastFatalIncident.date).getTime()) / (1000 * 3600 * 24),
      )
    : null

  overlay.innerHTML = `
      <div class="incident-card-container">
        <button class="close-button">×</button>
        <div class="incident-card incident-info">
          <h2><span class="emoji">✈️</span> ${incidentType} Incident Information</h2>
          <p><strong>Last Incident:</strong> ${incident.date}</p>
          <p><strong>Operator:</strong> ${incident.operator}</p>
          <p><strong>Aircraft:</strong> ${incident.type}</p>
          <p><strong>Location:</strong> ${incident.location}</p>
          <p><strong>Fatalities:</strong> ${incident.fatalities}</p>
        </div>
        <div class="incident-card incident-rate ${incidentRate > 1 ? 'high-risk' : 'low-risk'}">
          <h2><span class="emoji">📈</span> Incident Rate</h2>
          <p>${incidentRate.toFixed(2)} incidents per year</p>
        </div>
        <div class="incident-card time-since-incident ${timeSinceLastIncident > 365 ? 'low-risk' : 'high-risk'}">
          <h2><span class="emoji">⏳</span> Time Since Last Incident</h2>
          <p>${timeSinceLastIncident} days</p>
        </div>
        ${
          timeSinceLastFatalIncident !== null
            ? `<div class="incident-card time-since-fatal ${timeSinceLastFatalIncident > 365 ? 'low-risk' : 'high-risk'}">
                 <h2><span class="emoji">💀</span> Time Since Last Fatal Incident</h2>
                 <p>${timeSinceLastFatalIncident} days</p>
               </div>`
            : ''
        }
      </div>
    `

  const closeButton = overlay.querySelector('.close-button')
  closeButton.addEventListener('click', () => {
    overlay.remove()
  })

  return overlay
}
