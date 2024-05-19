
export const isDev = process.env.NODE_ENV == 'development'

const apiBase = isDev ? 'http://localhost:8000' : 'https://flight-server-dklp.onrender.com'

// Function to make API calls to the server
export async function fetchIncidentData(endpoint: string) {
  console.log('fetchIncidentData', endpoint)

  try {
    const response = await fetch(`${apiBase}${endpoint}`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching incident data:', error)
    return null
  }
}

// Function to fetch the latest fatal incident by airline
export async function fetchLatestFatalIncidentByAirline(airline: string) {
  const endpoint = `/latest-fatal-incident-by-airline/${encodeURIComponent(airline)}`
  const incident = await fetchIncidentData(endpoint)
  return incident
}

// Function to fetch the latest fatal incident by aircraft
export async function fetchLatestFatalIncidentByAircraft(aircraft: string) {
  if (aircraft.includes('Havilland')) {
    // Rename because in the API it's "DHC", and append teh Dash-8 or whatever model it is
    const aircraftParts = aircraft.split(' ')
    const aircraftModel = aircraftParts.pop()
    const aircraftType = aircraftParts.join(' ')
    aircraft = `DHC-${aircraftModel}`
  }

  const endpoint = `/latest-fatal-incident-by-aircraft/${encodeURIComponent(aircraft)}`
  const incident = await fetchIncidentData(endpoint)
  return incident
}

// Function to fetch the most dangerous airlines
export async function fetchMostDangerousAirlines(howMany: number = 10) {
  const endpoint = `/most-dangerous-airlines?how_many=${howMany}`
  const airlines = await fetchIncidentData(endpoint)
  return airlines
}

// Function to fetch the most dangerous aircrafts
export async function fetchMostDangerousAircrafts(howMany: number = 10) {
  const endpoint = `/most-dangerous-aircrafts?how_many=${howMany}`
  const aircrafts = await fetchIncidentData(endpoint)
  return aircrafts
}

// Function to fetch the most recent incidents by airline
export async function fetchMostRecentIncidentsByAirline(airline: string) {
  const endpoint = `/most-recent-incidents-by-airline/${encodeURIComponent(airline)}`
  const incidents = await fetchIncidentData(endpoint)
  return incidents
}

// Function to fetch the most recent incidents by aircraft
export async function fetchMostRecentIncidentsByAircraft(aircraft: string) {
  const endpoint = `/most-recent-incidents-by-aircraft/${encodeURIComponent(aircraft)}`
  const incidents = await fetchIncidentData(endpoint)
  return incidents
}