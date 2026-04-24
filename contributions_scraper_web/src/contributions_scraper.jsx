import React, { useState } from 'react'
import './contributions_scraper.css'

function ContributionsScraper({ onOpenSettings, onShowZooManager, results, setResults }) {
    
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
                     <svg className='upload-files' xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#242424"><path d="M440-320v-326L336-542l-56-58 200-200 200 200-56 58-104-104v326h-80ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/></svg>
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
                
                <div className='contributions-header-wrapper'>
                    <button className="manage-zoo-list-btn" onClick={onShowZooManager}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#242424"><path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z"/></svg>
                    </button>
                    <button className='download-results-btn' onClick={onOpenSettings}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#242424"><path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/></svg>
                        <span className='download-txt'>Download</span>
                    </button>
                </div>

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
                        <h3 className='title'>{fileName.replace(".pdf", "")}</h3>
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
