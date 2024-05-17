import { UIIncidentData } from '../../types'

export function createLoadingElement() {
  const overlay = document.createElement('div')
  overlay.classList.add('incident-overlay')

  overlay.innerHTML = `
    <div class="incident-card-container">
      <div class="incident-card incident-info">
        <div class="loading-indicator">
          <div class="spinner"></div>
          Loading...
        </div>
      </div>
    </div>
  `
  return overlay
}

export function createOverlayElement(incidents: UIIncidentData[]) {
  const overlay = document.createElement('div')
  overlay.classList.add('incident-overlay')

  const tabs = incidents
    .map(
      (incident, index) => `
    <button class="tab ${index === 0 ? 'active' : ''}" data-index="${index}">
      ${incident.type === 'Aircraft' ? incident.aircraft : incident.airline}
    </button>
  `,
    )
    .join('')

  const content = incidents
    .map(
      (incident, index) => `
    <div class="tab-content ${index === 0 ? 'active' : ''}" data-index="${index}">
      <div class="incident-card incident-info">
        <p>The following incident is being shown because your selected flight involves the same ${incident.type.toLowerCase()} (${incident.type === 'Aircraft' ? incident.aircraft : incident.airline}) as the incident.</p>
        <div class="info-row">
          <div class="info-item"><strong>Last Incident:</strong><p>${incident.date}</p></div>
          <div class="info-item"><strong>Fatalities:</strong><p>${incident.fatalities}</p></div>
          <div class="info-item"><strong>Location:</strong><p>${incident.location}</p></div>
          <div class="info-item"><strong>Airline:</strong><p>${incident.airline}</p></div>
        </div>
      </div>
      
      <div class="incident-card time-since-incident ${incident.daysSinceLastIncident > 365 ? 'low-risk' : 'medium-risk'}">
        <h3>Time Since Last ${incident.type === 'Aircraft' ? incident.aircraft : incident.airline} Incident</h3>
        <p>${incident.daysSinceLastIncident} days</p>
      </div>
      ${
        incident.fatalities > 0
          ? `
        <div class="incident-card time-since-fatal ${incident.daysSinceLastIncident > 365 ? 'low-risk' : 'high-risk'}">
          <h3>Time Since Last Fatal ${incident.type === 'Aircraft' ? incident.aircraft : incident.airline} Incident</h3>
          <p>${incident.daysSinceLastIncident} days</p>
        </div>
      `
          : `
        <div class="incident-card time-since-fatal low-risk">
          <h3>No Fatal ${incident.type === 'Aircraft' ? incident.aircraft : incident.airline} Incidents Found</h3>
          <p>This is a good sign!</p>
        </div>
      `
      }
    </div>
  `,
    )
    .join('')

  overlay.innerHTML = `
    <div class="incident-card-container">
      <button class="close-button">✖</button>
      <div class="tabs">
        ${tabs}
      </div>
      ${content}
      <small>Source: <a href="https://aviation-safety.net">https://aviation-safety.net</a></small>
      <small>If you notice an error, please report the issue <a href="mailto:yj@lasalida.io">here</a></small>
    </div>
  `

  const closeButton = overlay.querySelector('.close-button')
  closeButton?.addEventListener('click', () => {
    overlay.remove()
  })

  const tabButtons = overlay.querySelectorAll('.tab')
  const tabContents = overlay.querySelectorAll('.tab-content')
  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const index = button.getAttribute('data-index')
      tabButtons.forEach((btn) => btn.classList.remove('active'))
      tabContents.forEach((content) => content.classList.remove('active'))
      button.classList.add('active')
      // @ts-ignore
      overlay.querySelector(`.tab-content[data-index="${index}"]`).classList.add('active')
    })
  })

  return overlay
}
