import { useState } from 'react'
import './App.css'
import ContributionsScraper from './contributions_scraper.jsx'  
import ExportSettingsModal from './exportSettingsModal.jsx'

function App() {
  const [openExportSettings, setOpenExportSettings] = useState(false)

  return (
    <>
      <ContributionsScraper onOpenSettings={() => setOpenExportSettings(true)} />
      {openExportSettings && (
        <ExportSettingsModal onClose={() => setOpenExportSettings(false)} />
      )}
    </>
  )
}

export default App
