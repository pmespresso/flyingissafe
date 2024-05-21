import React, { useEffect, useState } from 'react';
import './Popup.css';
import { AllData, FlightLeg, IncidentData } from '../types';

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
        const _latestFatalAirlineIncidents = getLatestFatalIncident(response.airlineIncidents);

        setLatestAircraftIncident(_latestFatalAircraftIncidents);
        setLatestAirlineIncident(_latestFatalAirlineIncidents);
      }
    });
  }, []);

  const getLatestFatalIncident = (incidents: IncidentData[], identifier?: string) => {
    if (incidents.length === 0) {
      return null;
    }

    return incidents
      .filter((incident) => incident.fat > 0 && (!identifier || incident.type === identifier || incident.operator === identifier))
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
          <div className="journey-info">
            <p>For the journey you selected from A to B, you have {incidentData.journeyDetails.length} flight legs.</p>
          </div>
          {incidentData.journeyDetails.map((leg: FlightLeg, index) => {
            const aircraftIncident = latestFatalAircraftIncident
            const airlineIncident = latestFatalAirlineIncident

            return (
              <div key={index} className="card leg-info">
                <h3>Flight Leg {index + 1}</h3>
                <p>You are on a {leg.aircraft} with {leg.airline}.</p>
                {aircraftIncident ? (
                  <p>
                    The last time a {aircraftIncident.type} had a fatal incident was on {aircraftIncident.date} with {aircraftIncident.fat} fatalities.
                  </p>
                ) : (
                  <p>No fatal incidents found for {leg.aircraft}.</p>
                )}
                {airlineIncident ? (
                  <p>
                    The last time {airlineIncident.operator} had a fatal incident was on {airlineIncident.date} with {airlineIncident.fat} fatalities.
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