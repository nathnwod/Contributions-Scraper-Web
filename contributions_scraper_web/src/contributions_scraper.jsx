import React, { useState } from 'react'
import './contributions_scraper.css'

function ContributionsScraper() {
    const [results, setResults] = useState([])
    const [fileNames, setFileNames] = useState([])

    const handleUpload = async (e) => {
        const files = e.target.files // target is the input tag
        if (!files.length) return

        // store filenames for the left sidebar
        setFileNames(Array.from(files).map(f => f.name)) // basically makes an array out of the files list and maps the filename for each

        const formData = new FormData()
        for (let file of files) {
            formData.append('pdfs', file)
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/scrape', {
                method: 'POST',
                body: formData
            })
            const data = await response.json()
            console.log(data)  

            setResults(data)

        } catch (err) {
            console.error('Error:', err)
        }
    }

    
    const [exportStatus, setExportStatus] = useState('') 

    const handleExport = async () => {
        if(!results.length) return

        setExportStatus('Downloading...')

        try {
            const response = await fetch('http://127.0.0.1:5000/exportExcel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(results)
            })
            const data = await response.json()
            setExportStatus('Downloaded!')
            setTimeout(() => setExportStatus(''), 3000) // clears after 3 seconds
        } catch (err) {
            console.error('Error:', err)
            setExportStatus('Error downloading')
        }
    }


  return (
    <div className='main-container'>

        {/* article upload section */}
        <div className='article-upload-container'>

            <div className='article-upload-header'>
                <h2>Articles</h2>
                <input
                    type='file'
                    accept='.pdf'
                    multiple
                    style={{ display: 'none' }}
                    id='pdf-upload'
                    onChange={handleUpload}
                />

                <button className='upload-files-btn' onClick={() => document.getElementById('pdf-upload').click()}>
                     <svg className='upload-files' xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 -960 960 960" width="28px" fill="#242424"><path d="M440-320v-326L336-542l-56-58 200-200 200 200-56 58-104-104v326h-80ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/></svg>
                </button>
            </div>

            {/* insert logic to display each filename here */}
            {fileNames.map((fileName) => (
                <h3 className='article-filename-header' key={fileName}>
                    <svg className='file-svg' xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#242424"><path d="M280-280h280v-80H280v80Zm0-160h400v-80H280v80Zm0-160h400v-80H280v80Zm-80 480q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"/></svg>
                    <span>&nbsp;{fileName}</span>
                </h3>
            ))}
        </div>

        {/* contributions section */}
        <div className='contributions-results-container'>
            <div className='contributions-header'>
                <h2>Contributions</h2>

                {/* temporary */}
                {exportStatus && <p>{exportStatus}</p>} 

                
                <button className='download-results-btn' onClick={handleExport}>
                    Export as Excel <svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 -960 960 960" width="28px" fill="#242424"><path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/></svg>
                </button>
            </div>

            <div className='title-contributions-header'>
                <h3>Title</h3>
                <h3>Contribution</h3>
            </div>
            <div className='separator-line'></div>

            {/* insert same logic to display each filename */}
            {fileNames.map((fileName, index) => (
                <React.Fragment key={fileName}>
                    <div className='results'>
                        <h3>{fileName.replace(".pdf", "")}</h3>
                        {/* insert logic for each aquarim contribution */}
                        <h3 className={results[index]?.["detected zoos/aquariums"] === "None Found" ? 'none-found' : 'contributions'}>
                            {results[index]?.["detected zoos/aquariums"]}
                        </h3>
                    </div>
                    {/* puts a separator line after each line excluding the final line */}
                    {index < fileNames.length - 1 && <div className='separator-line'></div>} 

                </React.Fragment>

            ))}
            
            
                            
        </div>


    </div>
  )
}

export default ContributionsScraper
