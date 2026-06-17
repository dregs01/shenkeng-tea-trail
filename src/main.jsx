import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div className="stage">
      <div className="device">
        <App accentColor="#b15a3c" pinHalo={true} forgivingMode={true} />
      </div>
    </div>
  </React.StrictMode>
)
