import React, { useEffect, useState } from 'react'
import './Popup.css'
import { IncidentData } from '../types'

export const Popup: React.FC = () => {
  return (
    <main>
      {/* <button onClick={getAllAirlineIncidents}>Check All Airline Incidents</button> */}
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
