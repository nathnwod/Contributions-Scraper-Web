import { useState } from 'react'
import './App.css'
import ContributionsScraper from './contributions_scraper.jsx'  
import ExportSettingsModal from './exportSettingsModal.jsx'

function App() {
  const [openExportSettings, setOpenExportSettings] = useState(false)
  const [results, setResults] = useState([])

  return (
    <>
      <ContributionsScraper 
      onOpenSettings={() => setOpenExportSettings(true)}
      results={results}
      setResults={setResults} />
      {openExportSettings && (
        <ExportSettingsModal onClose={() => setOpenExportSettings(false)}
        results={results}
        setResults={setResults} 
         />
      )}
    </>
  )
}

export default App
