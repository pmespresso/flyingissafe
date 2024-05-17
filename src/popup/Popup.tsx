import React from 'react'
import './Popup.css'

export const Popup: React.FC = () => {
  return (
    <main>
      <header>
        <h1>Flight Incident Tracker</h1>
      </header>
      <section>
        <p>
          This extension enhances your flight search experience by providing important safety
          information about the airlines and aircraft involved in your selected flights.
        </p>
        <p>
          When you view the details of a flight, the extension will display the most recent incident
          information, including:
        </p>
        <ul>
          <li>Total incidents since 1919 for the airline and aircraft type</li>
          <li>Time since the last incident for the airline and aircraft type</li>
          <li>
            Time since the last fatal incident for the airline and aircraft type (if applicable)
          </li>
        </ul>
        <p>The information is color-coded to indicate the level of risk:</p>
        <ul>
          <li>
            <span className="low-risk">Green</span>: Low risk (last incident more than a year ago)
          </li>
          <li>
            <span className="medium-risk">Orange</span>: Medium risk (last incident within the past
            year)
          </li>
          <li>
            <span className="high-risk">Red</span>: High risk (last fatal incident within the past
            year)
          </li>
        </ul>
      </section>
      <footer>
        <small>
          Source: <a href="https://aviation-safety.net">https://aviation-safety.net</a>
        </small>
        <br />
        <small>
          If you notice an error, please report the issue <a href="mailto:yj@lasalida.io">here</a>
        </small>
        <p>Stay informed and travel with confidence using the Flight Incident Tracker extension.</p>
      </footer>
    </main>
  )
}

export default Popup
