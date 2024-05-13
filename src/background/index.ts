console.log('background script running')
// background.js
import Papa from 'papaparse'

// Function to fetch and parse the CSV data
function fetchAndParseCSV() {
  // Replace 'path/to/your/csv/file.csv' with the actual path or URL to your CSV file
  console.log('fetching data')
  fetch('/data/airline_safety_data.csv')
    .then((response) => response.text())
    .then((data) => {
      // Parse the CSV data using Papa Parse
      Papa.parse(data, {
        header: true,
        complete: function (results) {
          // Store the parsed data in Chrome storage
          chrome.storage.local.set({ incidentData: results.data }, function () {
            console.log('CSV data stored in Chrome storage')
          })
        },
      })
    })
    .catch((error) => {
      console.error('Error fetching or parsing CSV data:', error)
    })
}

// Fetch and parse the CSV data when the extension is installed or updated
chrome.runtime.onInstalled.addListener(fetchAndParseCSV)
