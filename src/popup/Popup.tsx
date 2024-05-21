import React, { useEffect, useState } from 'react';
import './Popup.css';
import { AllData, FlightLeg, IncidentData } from '../types';

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
    if (incidents.length === 0) {
      return null;
    }

    return incidents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  };

  return (
    <main>
      <h1>Flight Safety Information</h1>
      
      {incidentData ? (
        <>
          <div className="risk-level">
            <h2>Journey Risk Level: {incidentData.riskLevel}</h2>
          </div>
          <div className="journey-info">
            <p>For the journey you selected from A to B, you have {incidentData.journeyDetails.length} flight legs.</p>
          </div>
          {incidentData.journeyDetails.map((leg: FlightLeg, index) => {
            const latestAircraftIncident = getLatestFatalIncident(leg.aircraftIncidents);
            const latestAirlineIncident = getLatestFatalIncident(leg.airlineIncidents);

            return (
              <div key={index} className="card leg-info">
                <h3>Flight Leg {index + 1}</h3>
                <p>You are on a {leg.aircraft} with {leg.airline}.</p>
                {latestAircraftIncident ? (
                  <p>
                    The last time a {latestAircraftIncident.type} had a fatal incident was on {latestAircraftIncident.date} with {latestAircraftIncident.fat} fatalities.
                  </p>
                ) : (
                  <p>No fatal incidents found for {leg.aircraft}.</p>
                )}
                {latestAirlineIncident ? (
                  <p>
                    The last time {latestAirlineIncident.operator} had a fatal incident was on {latestAirlineIncident.date} with {latestAirlineIncident.fat} fatalities.
                  </p>
                ) : (
                  <p>No fatal incidents found for {leg.airline}.</p>
                )}
              </div>
            );
          })}
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