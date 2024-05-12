import { useState, useEffect } from 'react'

import './Options.css'

export const Options = () => {
  const [countSync, setCountSync] = useState(0)
  const link = 'https://github.com/guocaoyi/create-chrome-ext'

  useEffect(() => {
    chrome.storage.sync.get(['count'], (result) => {
      setCountSync(result.count || 0)
    })

    chrome.runtime.onMessage.addListener((request) => {
      if (request.type === 'COUNT') {
        setCountSync(request.count || 0)
      }
    })
  }, [])

  return (
    <main>
      <div className="container">
        <h1>Airline Incident Overlay</h1>
        <div className="settings">
          <label htmlFor="enable-overlay">Enable Overlay:</label>
          <input type="checkbox" id="enable-overlay" checked />
        </div>
        <div className="settings">
          <label htmlFor="date-range">Incident Date Range:</label>
          <select id="date-range">
            <option value="1">Last 1 Year</option>
            <option value="3">Last 3 Years</option>
            <option value="5" selected>
              Last 5 Years
            </option>
            <option value="10">Last 10 Years</option>
            <option value="all">All Time</option>
          </select>
        </div>
        <button id="save-btn">Save Settings</button>
      </div>
    </main>
  )
}

export default Options
