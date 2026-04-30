import { useState, useEffect } from 'react'
import './App.css'
import ContributionsScraper from './contributions_scraper.jsx'  
import ExportSettingsModal from './exportSettingsModal.jsx'
import ManageZooListModal from './manageZooListModal.jsx'



function App() {
  const [openExportSettings, setOpenExportSettings] = useState(false)
  const [showZooManager, setShowZooManager] = useState(false);
  const [results, setResults] = useState([])
  const [files, setFiles] = useState([]) 
  const [isScraping, setIsScraping] = useState(false)

    useEffect(() => {
      document.body.style.cursor = isScraping ? 'wait' : ''
    }, [isScraping])

    async function reRun() {
      if(!files.length) return
      setIsScraping(true)
      try {
        const formData = new FormData()
        for (let file of files) formData.append('pdfs', file)

      const response = await fetch('http://127.0.0.1:5000/scrape', {
        method: 'POST',
        body: formData
        })
        const data = await response.json()
        setResults(data)
      } finally {
          setIsScraping(false)
      }
    }

  return (
    <>
      <ContributionsScraper 
        onOpenSettings={() => setOpenExportSettings(true)}
        onShowZooManager={() => setShowZooManager(true)}
        results={results}
        setResults={setResults} 
        files={files}
        setFiles={setFiles}
        isScraping={isScraping}
        setIsScraping={setIsScraping}
      />

      {isScraping && !showZooManager &&(
        <>
          <div className="background-shadow"></div>
          <div className="scraping-overlay-text">
            <span className="saving-dots">Scraping</span>
          </div>
        </>
      )}
          
      {openExportSettings && (
        <ExportSettingsModal onClose={() => setOpenExportSettings(false)}
        results={results}
        setResults={setResults} 
   
         />
      )}

      {showZooManager && (
        <ManageZooListModal 
          onClose={() => setShowZooManager(false)}
          onSaved={reRun}
        />
      )}
    </>
  )
}

export default App
