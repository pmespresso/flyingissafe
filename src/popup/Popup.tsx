import React, { useEffect, useState } from 'react';
import './Popup.css';
import { AllData, IncidentData } from '../types';


export const Popup: React.FC = () => {
  const [incidentData, setIncidentData] = useState<AllData | null>(null);
  const [latestFatalAircraftIncident, setLatestAircraftIncident] = useState<IncidentData | null>(null);
  const [latestFatalAirlineIncident, setLatestAirlineIncident] = useState<IncidentData | null>(null);

  useEffect(() => {
    // Request the incident data from the background script
    chrome.runtime.sendMessage({ type: 'getIncidentData' }, (response) => {
      if (response) {
        console.log('Incident data:', response);
        setIncidentData(response);
        const _latestFatalAircraftIncidents = getLatestFatalIncident(response.aircraftIncidents);
        const _latestFatalAirlineIncidents =  getLatestFatalIncident(response.airlineIncidents);

        setLatestAircraftIncident(_latestFatalAircraftIncidents);
        setLatestAirlineIncident(_latestFatalAirlineIncidents);
      }
    });
  }, []);

  const getLatestFatalIncident = (incidents: IncidentData[]) => {
    if (incidents.length === 0) {
      return null;
    }

    return incidents
      .filter((incident) => incident.fat > 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  };

  return (
    <main>
      <h1>Flight Safety Information</h1>
      
      {incidentData ? (
        <>
        <div className="risk-level">
          <h2>Journey Risk Level: {incidentData.riskLevel}</h2>
        </div>
          <div className="card leg-info">
            <div className="airline-info">
              <h3>Airline Incidents in Your Journey</h3>
                <div >
                  <h4>{latestFatalAirlineIncident?.operator}:</h4>
                  <p>{latestFatalAirlineIncident ? (
                      <>
                        Latest fatal incident on {latestFatalAirlineIncident.date} with{' '}
                        {latestFatalAirlineIncident.fat} fatalities.
                      </>
                    ) : (
                      'No fatal incidents.'
                    )}
                  </p>
                </div>
            </div>
            <div className="aircraft-info">
              <h3>Aircraft Incidents in Your Journey</h3>
                  <div key={latestFatalAircraftIncident?.type}>
                    <h4>{latestFatalAircraftIncident?.type}:</h4>
                    <p>{latestFatalAircraftIncident ? (
                        <>
                          Latest fatal incident on {latestFatalAircraftIncident.date} at{' '}
                          {latestFatalAircraftIncident.location} with{' '}
                          {latestFatalAircraftIncident.fat} fatalities.
                        </>
                      ) : (
                        'No fatal incidents.'
                      )}
                    </p>
                  </div>

            </div>
          </div>
          
        </>
      ) : (
        <p>Loading safety information...</p>
      )}
      <footer>
        {/* ... */}
      </footer>
    </main>
  );
};

export default Popup;