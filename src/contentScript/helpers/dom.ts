import { IncidentData } from '../../types'

export function createOverlayElement(
  lastIncident: IncidentData | null,
  lineOrCraft: 'Airline' | 'Aircraft',
) {
  const overlay = document.createElement('div')
  overlay.classList.add('incident-overlay')

  let incidentInfo = ''
  let timeSinceLastIncident = ''
  let timeSinceLastFatalIncident = ''

  if (lastIncident) {
    const lastIncidentDate = new Date(lastIncident.date)
    const timeSinceLastIncidentDays = Math.floor(
      (new Date().getTime() - lastIncidentDate.getTime()) / (1000 * 3600 * 24),
    )

    incidentInfo = `
      <div class="incident-card incident-info">
        <p class="incident-reason">The following incident is being shown because your selected flight involves the same ${lineOrCraft.toLowerCase()} (${
          lastIncident[lineOrCraft.toLowerCase() === 'airline' ? 'operator' : 'type']
        }) as the incident.</p>
        <div class="info-row">
          <div class="info-item">
            <strong>Last Incident:</strong>
            <p>${lastIncident.date}</p>
          </div>
          <div class="info-item">
            <strong>Fatalities:</strong>
            <p>${lastIncident.fat}</p>
          </div>
        </div>
      </div>
    `

    timeSinceLastIncident = `
      <div class="incident-card time-since-incident ${
        timeSinceLastIncidentDays > 365 ? 'low-risk' : 'medium-risk'
      }">
        <h3><span class="emoji">⏳</span> Time Since Last ${
          lastIncident[lineOrCraft.toLowerCase() === 'airline' ? 'operator' : 'type']
        } Incident</h3>
        <p>${timeSinceLastIncidentDays} days</p>
      </div>
    `

    if (lastIncident.fat > 0) {
      timeSinceLastFatalIncident = `
        <div class="incident-card time-since-fatal ${
          timeSinceLastIncidentDays > 365 ? 'low-risk' : 'high-risk'
        }">
          <h3><span class="emoji">💀</span> Time Since Last Fatal ${
            lastIncident[lineOrCraft.toLowerCase() === 'airline' ? 'operator' : 'type']
          } Incident</h3>
          <p>${timeSinceLastIncidentDays} days</p>
        </div>
      `
    }
  } else {
    incidentInfo = `
      <div class="incident-card incident-info">
        <p>No recent incidents found for the selected ${lineOrCraft.toLowerCase()}.</p>
      </div>
    `
  }

  overlay.innerHTML = `
    <div class="incident-card-container">
      <button class="close-button">X</button>
      <div class="incident-card incident-info">
        <h2><span class="emoji">✈️</span> Incident Information</h2>
        <div class="info-row">
          <div class="info-item">
            <strong>${lineOrCraft}:</strong>
            <p>${lastIncident ? lastIncident[lineOrCraft.toLowerCase() === 'airline' ? 'operator' : 'type'] : 'N/A'}</p>
          </div>
        </div>
      </div>
      ${incidentInfo}
      ${timeSinceLastIncident}
      ${timeSinceLastFatalIncident}
      <small>Source: <a href="https://aviation-safety.net">https://aviation-safety.net</a></small>
      <small>If you notice an error, please report the issue <a href="mailto:yj@lasalida.io">here</a></small>
    </div>
  `

  const closeButton = overlay.querySelector('.close-button')
  closeButton?.addEventListener('click', () => {
    overlay.remove()
  })

  return overlay
}
