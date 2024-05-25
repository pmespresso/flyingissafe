// src/newtab/NewTab.tsx
import React, { useEffect, useState } from 'react'
import './NewTab.css'
import Footer from '../Footer'

export const isDev = process.env.NODE_ENV == 'development'

const apiBase = isDev ? 'http://localhost:8000' : 'https://flight-server-dklp.onrender.com'

export interface MostDangerousAirlineData {
  operator: string
  total_incidents: number
  total_fatalities: number
}

export interface MostDangerousAircraftData {
  type: string
  total_incidents: number
  total_fatalities: number
}

const NewTab: React.FC = () => {
  const [mostDangerousAirlines, setMostDangerousAirlines] = useState<MostDangerousAirlineData[]>([])
  const [mostDangerousAircrafts, setMostDangerousAircrafts] = useState<MostDangerousAircraftData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if data exists in localStorage
        const cachedAirlinesData = localStorage.getItem('mostDangerousAirlines')
        const cachedAircraftsData = localStorage.getItem('mostDangerousAircrafts')

        if (cachedAirlinesData && cachedAircraftsData) {
          // If data exists in localStorage, parse and set the state
          setMostDangerousAirlines(JSON.parse(cachedAirlinesData))
          setMostDangerousAircrafts(JSON.parse(cachedAircraftsData))
          setLoading(false)
        } else {
          // If data doesn't exist in localStorage, fetch from the API
          const [airlinesResponse, aircraftsResponse] = await Promise.all([
            fetch(`${apiBase}/most-dangerous-airlines`),
            fetch(`${apiBase}/most-dangerous-aircrafts`),
          ])

          const airlinesData = await airlinesResponse.json()
          const aircraftsData = await aircraftsResponse.json()

          // Store the fetched data in localStorage
          localStorage.setItem('mostDangerousAirlines', JSON.stringify(airlinesData))
          localStorage.setItem('mostDangerousAircrafts', JSON.stringify(aircraftsData))

          setMostDangerousAirlines(airlinesData)
          setMostDangerousAircrafts(aircraftsData)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to fetch data. Please try again later.')
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <main className="dashboard">
      <header>
        <h1>Flight Incidents Tracker</h1>
        <p>Data sourced from: <a href="https://aviation-safety.net/database/">Aviation Safety Network</a></p>
      </header>
      <section className="incidents-container">
      <div className="incident-list">
          <h2>Most Dangerous Airlines</h2>
          <ul>
            {mostDangerousAirlines.map((airline, index) => (
              <li key={index}>
                <div className="airline-info">
                  <h3>{airline.operator}</h3>
                  <div className="airline-details">
                    <div className="detail-item">
                      <span className="icon">📊</span>
                      <span className="label">Total Incidents:</span>
                      <span className="value">{airline.total_incidents}</span>
                    </div>
                    <div className="detail-item">
                      <span className="icon">💔</span>
                      <span className="label">Total Fatalities:</span>
                      <span className="value">{airline.total_fatalities}</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="incident-list">
          <h2>Most Dangerous Aircrafts</h2>
          <ul>
            {mostDangerousAircrafts.map((aircraft, index) => (
              <li key={index}>
                <div className="aircraft-info">
                  <h3>{aircraft.type}</h3>
                  <div className="aircraft-details">
                    <div className="detail-item">
                      <span className="icon">📊</span>
                      <span className="label">Total Incidents:</span>
                      <span className="value">{aircraft.total_incidents}</span>
                    </div>
                    <div className="detail-item">
                      <span className="icon">💔</span>
                      <span className="label">Total Fatalities:</span>
                      <span className="value">{aircraft.total_fatalities}</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
            <Footer />
    </main>
  )
}

export default NewTab