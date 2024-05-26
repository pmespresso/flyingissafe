// src/newtab/NewTab.tsx
import React, { useCallback, useEffect, useState } from 'react'
import Chart from 'chart.js/auto'
import './NewTab.css'
import Footer from '../Footer'
import { IncidentData } from '../types'

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

export interface UniqueAirline {
  operator: string
}

export interface IncidentDataByAirline extends Omit<IncidentData, 'fatalities'> {
  fatalities: number
}

const NewTab: React.FC = () => {
  const [mostDangerousAirlines, setMostDangerousAirlines] = useState<MostDangerousAirlineData[]>([])
  const [mostDangerousAircrafts, setMostDangerousAircrafts] = useState<MostDangerousAircraftData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedAirline, setSelectedAirline] = useState('')
  const [airlineIncidents, setAirlineIncidents] = useState<IncidentDataByAirline[]>([])
  const [uniqueAirlines, setUniqueAirlines] = useState<UniqueAirline[]>([])
  
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
        const uniqueAirlinesResponse = await fetch(`${apiBase}/all-unique-airlines`)
        const uniqueAirlinesData = await uniqueAirlinesResponse.json()
        
        setUniqueAirlines(uniqueAirlinesData)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to fetch data. Please try again later.')
        setLoading(false)
      }
    }
    fetchData()
  }, [])
 
  const createAirlinesChart = useCallback(() => {
    const ctx = document.getElementById('airlinesChart') as HTMLCanvasElement
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: mostDangerousAirlines.map((airline) => airline.operator),
          datasets: [
            {
              label: 'Total Incidents',
              data: mostDangerousAirlines.map((airline) => airline.total_incidents),
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
            {
              label: 'Total Fatalities',
              data: mostDangerousAirlines.map((airline) => airline.total_fatalities),
              backgroundColor: 'rgba(255, 99, 132, 0.6)',
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      })
    }
  }, [mostDangerousAirlines])

  const createAircraftsChart = useCallback(() => {
    const ctx = document.getElementById('aircraftsChart') as HTMLCanvasElement
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: mostDangerousAircrafts.map((aircraft) => aircraft.type),
          datasets: [
            {
              label: 'Total Incidents',
              data: mostDangerousAircrafts.map((aircraft) => aircraft.total_incidents),
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
            {
              label: 'Total Fatalities',
              data: mostDangerousAircrafts.map((aircraft) => aircraft.total_fatalities),
              backgroundColor: 'rgba(255, 99, 132, 0.6)',
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      })
    }
  }, [mostDangerousAircrafts])

  useEffect(() => {
    if (!loading) {
      createAirlinesChart()
      createAircraftsChart()
    }
  }, [loading, mostDangerousAirlines, mostDangerousAircrafts])

  const handleAirlineChange = useCallback(async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const airline = event.target.value
    setSelectedAirline(airline)

    try {
      const response = await fetch(`${apiBase}/all-incidents-by-airline/${encodeURIComponent(airline)}`)
      const data = await response.json()

      setAirlineIncidents(data.data)
    } catch (error) {
      console.error('Error fetching airline incidents:', error)
      setError('Failed to fetch airline incidents. Please try again later.')
    }
  }, [])

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <main className="dashboard">
      <header className='header'>
        <div className='title'>
          <img src='/img/logo.png' alt="Flight Incidents Tracker Logo" height={50} width={50} /> 
          <h1>Flight Incidents Tracker</h1>
        </div>
        <div className='tagline'>
          <img src="/img/chrome-logo.png" alt="Chrome Logo" height={50} width={80} />
          <h2>The #1 Chrome Extension To Avoid Accidentally Taking a Boeing 737 MAX</h2>
        </div>
        <p>Data sourced from: <a href="https://aviation-safety.net/database/">Aviation Safety Network</a></p>
      </header>
      
      <section className="incidents-container">
        <div className="incident-list">
          <h2>Most Dangerous Airlines (Civilian and Military)</h2>
          <canvas id="airlinesChart"></canvas>
        </div>

        <div className="incident-list">
          <h2>Most Dangerous Aircrafts (Civilian and Military)</h2>
          <canvas id="aircraftsChart"></canvas>
        </div>
      </section>

      <section className="airline-incidents-container">
        <h2>Airline Incidents</h2>
        <select value={selectedAirline} onChange={handleAirlineChange} className="airline-select">
          <option value="">Select an airline</option>
          {uniqueAirlines.map((airline) => (
            <option key={airline.operator} value={airline.operator}>
              {airline.operator}
            </option>
          ))}
        </select>
        {selectedAirline && (
          <ul className="airline-incidents-list">
            {airlineIncidents.map((incident, index) => (
              <li key={index} className="airline-incident-item">
                <div className="airline-incident-info">
                  <h3>{incident.type}</h3>
                  <div className="airline-incident-details">
                    <div className="detail-item">
                      <span className="icon">📅</span>
                      <span className="label">Date:</span>
                      <span className="value">{incident.date}</span>
                    </div>
                    <div className="detail-item">
                      <span className="icon">💔</span>
                      <span className="label">Fatalities:</span>
                      <span className="value">{incident.fatalities}</span>
                    </div>
                    <div className="detail-item">
                      <span className="icon">📍</span>
                      <span className="label">Location:</span>
                      <span className="value">{incident.location}</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Footer />
    </main>
  )
}

export default NewTab