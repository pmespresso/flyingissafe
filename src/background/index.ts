// background.ts
chrome.runtime.onInstalled.addListener(() => {
  console.log('Background script running')
})

// Function to make API calls to the localhost server
async function fetchIncidentData(endpoint: string) {
  console.log('fetchIncidentData', endpoint)

  try {
    const response = await fetch(`http://localhost:8000${endpoint}`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching incident data:', error)
    return null
  }
}

// Function to fetch the latest fatal incident by airline
async function fetchLatestFatalIncidentByAirline(airline: string) {
  const endpoint = `/latest-fatal-incident-by-airline/${encodeURIComponent(airline)}`
  const incident = await fetchIncidentData(endpoint)
  return incident
}

// Function to fetch the latest fatal incident by aircraft
async function fetchLatestFatalIncidentByAircraft(aircraft: string) {
  const endpoint = `/latest-fatal-incident-by-aircraft/${encodeURIComponent(aircraft)}`
  const incident = await fetchIncidentData(endpoint)
  return incident
}

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchLatestFatalIncidentByAirline') {
    fetchLatestFatalIncidentByAirline(request.airline)
      .then((incident) => sendResponse({ incident }))
      .catch((error) => sendResponse({ error }))
    return true // Required to use sendResponse asynchronously
  }

  if (request.action === 'fetchLatestFatalIncidentByAircraft') {
    fetchLatestFatalIncidentByAircraft(request.aircraft)
      .then((incident) => sendResponse({ incident }))
      .catch((error) => sendResponse({ error }))
    return true // Required to use sendResponse asynchronously
  }
})
