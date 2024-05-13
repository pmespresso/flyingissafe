export interface IncidentData {
  date: string
  type: string
  reg: string
  operator: string
  fatalities: number
  location: string
}

// Function to create an overlay element
export function createOverlayElement(incidents: IncidentData[], incidentType: string) {
  const overlay = document.createElement('div')
  overlay.classList.add('incident-overlay')
  overlay.innerHTML = `
      <div class="incident-card">
        <div class="incident-header">
          <h2>Last ${incidentType} Incident${incidents.length > 1 ? 's' : ''}</h2>
        </div>
        <div class="incident-body">
          ${incidents
            .map(
              (incident) => `
            <p><strong>Date:</strong> ${incident.date}</p>
            <p><strong>Operator:</strong> ${incident.operator}</p>
            <p><strong>Aircraft:</strong> ${incident.type}</p>
            <p><strong>Location:</strong> ${incident.location}</p>
            <p><strong>Fatalities:</strong> ${incident.fatalities}</p>
            <hr>
          `,
            )
            .join('')}
        </div>
      </div>
    `
  return overlay
}
