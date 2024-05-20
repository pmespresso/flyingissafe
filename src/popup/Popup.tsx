import React, { useEffect, useState } from 'react'
import './Popup.css'
import { IncidentData } from '../types'

export const Popup: React.FC = () => {
  const [incidentData, setIncidentData] = useState<any>(null);

  useEffect(() => {
    // Request the incident data from the background script
    chrome.runtime.sendMessage({ type: 'getIncidentData' }, (response) => {
        if (response) {
            setIncidentData(response);
        }
    });
}, []);


  return (
    <main>
       {incidentData ? (
                <div>
                    <h2>Airline Incidents</h2>
                    <pre>{JSON.stringify(incidentData.airlineIncidents, null, 2)}</pre>
                    <h2>Aircraft Incidents</h2>
                    <pre>{JSON.stringify(incidentData.aircraftIncidents, null, 2)}</pre>
                </div>
            ) : (
                <p>No incident data available.</p>
            )}
      <footer>
        <small>
          Source: <a href="https://aviation-safety.net">https://aviation-safety.net</a>
        </small>
        <br />
        <small>
          If you notice an error, please report the issue <a href="mailto:yj@lasalida.io">here</a>
        </small>
        <p>Stay informed and travel with confidence using the Flight Incident Tracker extension.</p>

        <small>
          <a href="https://passportbroslist.com">Research Where to Go</a>
        </small>
      </footer>
    </main>
  )
}

export default Popup
