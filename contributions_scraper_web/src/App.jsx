import { useState } from 'react'
import './App.css'
import ContributionsScraper from './contributions_scraper.jsx'  
import ExportSettingsModal from './exportSettingsModal.jsx'
import ManageZooListModal from './manageZooListModal.jsx'

function App() {
  const [openExportSettings, setOpenExportSettings] = useState(false)
  const [showZooManager, setShowZooManager] = useState(false);
  const [results, setResults] = useState([])

  return (
    <>
      <ContributionsScraper 
      onOpenSettings={() => setOpenExportSettings(true)}
      onShowZooManager={() => setShowZooManager(true)}
      results={results}
      setResults={setResults} />
      {openExportSettings && (
        <ExportSettingsModal onClose={() => setOpenExportSettings(false)}
        results={results}
        setResults={setResults} 
         />
      )}

      {showZooManager && (
        <ManageZooListModal onClose={() => setShowZooManager(false)}>
          
        </ManageZooListModal>
      )}
    </>
  )
}

export default App
