export interface IncidentData {
  date: string
  type: string
  reg: string
  operator: string
  fatalities: number
  location: string
}

// Function to create an overlay element
export function createOverlayElement(incidentData: IncidentData) {
  const overlay = document.createElement('div')
  overlay.classList.add('incident-overlay')
  overlay.style.position = 'absolute'
  overlay.style.top = '0'
  overlay.style.left = '0'
  overlay.style.backgroundColor = 'rgba(255, 0, 0, 0.8)'
  overlay.style.color = 'white'
  overlay.style.padding = '10px'
  overlay.style.borderRadius = '5px'
  overlay.style.zIndex = '9999'
  overlay.style.fontSize = '14px'
  overlay.style.fontWeight = 'bold'
  overlay.innerHTML = `
      <p>Last Incident: ${incidentData.date}</p>
    `
  return overlay
}

// Function to extract an element using XPath
export function extractElementUsingXPath(contextNode, xpath) {
  const result = document.evaluate(
    xpath,
    contextNode,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null,
  )
  return result.singleNodeValue
}

// Function to extract detail using XPath
export function extractDetailUsingXPath(element, xpath) {
  const detail = element.evaluate(xpath, element, null, XPathResult.STRING_TYPE, null)
  return detail.stringValue.trim()
}

// Function to find the flight options container based on the heading text
export function findFlightOptionsContainer(headingText) {
  const headings = document.querySelectorAll('h3')
  console.log('Headings:', headings)
  for (const heading of headings) {
    console.log('Heading:', heading.textContent)
    if (heading.textContent.includes(headingText)) {
      return heading.nextElementSibling
    }
  }
  return null
}
