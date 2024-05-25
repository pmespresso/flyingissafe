import React, { useEffect, useState } from 'react';
import Footer from '../Footer';
import './Popup.css';
import { AllData, FlightLeg, IncidentData } from '../types';

const HIGH_RISK_AIRCRAFTS = [
  "Boeing 737MAX 8 Passenger",
  "Boeing 737MAX 9 Passenger",
];

const HIGH_RISK_AIRLINES = [
  "Lion Air",
  "Ethiopian Airlines",
];

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

  const getIncidentClassName = (incident: IncidentData) => {
    const daysAgo = (Date.now() - new Date(incident.date).getTime()) / (1000 * 3600 * 24);
    const isFatal = incident.fat > 0;
    const isRecent = daysAgo <= 365; // Consider incidents within the last year as recent

    if (isFatal && isRecent) {
      return 'incident-info fatal-recent';
    } else if (isFatal && !isRecent) {
      return 'incident-info fatal-old';
    } else if (!isFatal && isRecent) {
      return 'incident-info nonfatal-recent';
    } else {
      return 'incident-info nonfatal-old';
    }
  };

  const getLatestFatalIncident = (incidents: IncidentData[]) => {
    if (incidents.length === 0) {
      return null;
    }

    return incidents.filter((incident) => incident.fat > 0).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  };

  return (
    <main>
      
      
      {incidentData ? (
        <>
        <div className="popup-heading">
          <img src="/img/logo.png" alt="Logo" height={30} width={30} className='popup-logo' />
          <h1>Flight Incident Tracker</h1>
        </div>
          <div className="risk-level">
            <h2>Journey Risk Level: <span className={`risk-${incidentData.riskLevel?.toLowerCase()}`}>{incidentData.riskLevel}</span></h2>
          </div>
          <div className="journey-info">
            <p>For the journey you selected from A to B, you have {incidentData.journeyDetails.length} flight legs.</p>
          </div>
          {incidentData.journeyDetails.map((leg: FlightLeg, index) => {
            const latestAircraftIncident = getLatestFatalIncident(leg.aircraftIncidents);
            const latestAirlineIncident = getLatestFatalIncident(leg.airlineIncidents);
            const isHighRiskAircraft = HIGH_RISK_AIRCRAFTS.includes(leg.aircraft);
            const isHighRiskAirline = HIGH_RISK_AIRLINES.includes(leg.airline);

            return (
              <div key={index} className={`card leg-info ${isHighRiskAircraft || isHighRiskAirline ? 'high-risk' : ''}`}>
                <h3>Flight Leg {index + 1}</h3>
                <h4>You are on a <b>{leg.aircraft}</b> with <b>{leg.airline}</b>.</h4>
                {isHighRiskAircraft && <p className="risk-warning">This aircraft is considered high risk.</p>}
                {isHighRiskAirline && <p className="risk-warning">This airline is considered high risk.</p>}
                {latestAircraftIncident ? (
                  <p className={getIncidentClassName(latestAircraftIncident)}>

                    The last time a <b>{latestAircraftIncident.type}</b> had a fatal incident was on <b>{latestAircraftIncident.date}</b> with <b>{latestAircraftIncident.fat}</b> fatalities. {latestAircraftIncident.location ? `The incident occurred in ${latestAircraftIncident.location}.` : ''}
                  </p>
                ) : (
                  <p>No fatal incidents found for <b>{leg.aircraft}</b>.</p>
                )}
                {latestAirlineIncident ? (
                <p className={getIncidentClassName(latestAirlineIncident)}>

                    The last time <b>{latestAirlineIncident.operator}</b> had a fatal incident was on <b>{latestAirlineIncident.date}</b> with <b>{latestAirlineIncident.fat}</b> fatalities. {latestAirlineIncident.location ? `The incident occurred in ${latestAirlineIncident.location}.` : ''}
                  </p>
                ) : (
                  <p>No fatal incidents found for <b>{leg.airline}</b>.</p>
                )}
              </div>
            );
          })}
        </>
      ) : (
        <div>
          <img src="/img/how-to.png" alt="How to use" height={280} width={400} />
        </div>
      )}
      <Footer />
    </main>
  );
};

export default Popup;