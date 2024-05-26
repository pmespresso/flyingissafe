// src/newtab/NewTab.tsx
import React, { useCallback, useEffect, useState } from 'react'
import Chart from 'chart.js/auto'
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
        <Footer />
    </main>
  )
}

export default NewTab