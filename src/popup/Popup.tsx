import React, { useEffect, useState } from 'react';
import './Popup.css';
import { AllData, IncidentData } from '../types';


export const Popup: React.FC = () => {
  const [incidentData, setIncidentData] = useState<AllData | null>(null);

  useEffect(() => {
    // Request the incident data from the background script
    chrome.runtime.sendMessage({ type: 'getIncidentData' }, (response) => {
      if (response) {
        console.log('Incident data:', response);
        setIncidentData(response);
      }
    });
  }, []);

  const getLatestFatalIncident = (incidents: IncidentData[]) => {
    const fatalIncidents = incidents.filter((incident) => incident.fat > 0);
    if (fatalIncidents.length > 0) {
      return fatalIncidents[0];
    }
    return null;
  };

  const getRiskLevel = (incidentData: AllData) => {
    const totalIncidents = incidentData.airlineIncidents.length + incidentData.aircraftIncidents.length;
    if (totalIncidents === 0) {
      return 'Low';
    } else if (totalIncidents <= 3) {
      return 'Moderate';
    } else {
      return 'High';
    }
  };

  return (
    <main>
      <h1>Flight Safety Information</h1>
      {incidentData ? (
        <>
          <p>Your journey includes the following airlines and aircraft:</p>
          <div className="card leg-info">
            <div className="airline-info">
              <h3>Airlines: {incidentData.airlinesInTheJourney.join(', ')}</h3>
              {incidentData.airlinesInTheJourney.map((airline) => {
                const airlineIncidents = incidentData.airlineIncidents.filter(
                  (incident) => incident.operator === airline
                );
                return (
                  <div key={airline}>
                    <p>
                      {airline}: {getLatestFatalIncident(airlineIncidents) ? (
                        <>
                          Latest fatal incident on {getLatestFatalIncident(airlineIncidents)!.date} at{' '}
                          {getLatestFatalIncident(airlineIncidents)!.location} with{' '}
                          {getLatestFatalIncident(airlineIncidents)!.fat} fatalities.
                        </>
                      ) : (
                        'No fatal incidents.'
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="aircraft-info">
              <h3>Aircraft: {incidentData.aircraftsInTheJourney.join(', ')}</h3>
              {incidentData.aircraftsInTheJourney.map((aircraft) => {
                const aircraftIncidents = incidentData.aircraftIncidents.filter(
                  (incident) => incident.type === aircraft
                );
                return (
                  <div key={aircraft}>
                    <p>
                      {aircraft}: {getLatestFatalIncident(aircraftIncidents) ? (
                        <>
                          Latest fatal incident on {getLatestFatalIncident(aircraftIncidents)!.date} at{' '}
                          {getLatestFatalIncident(aircraftIncidents)!.location} with{' '}
                          {getLatestFatalIncident(aircraftIncidents)!.fat} fatalities.
                        </>
                      ) : (
                        'No fatal incidents.'
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="risk-level">
            <h2>Journey Risk Level: {getRiskLevel(incidentData)}</h2>
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