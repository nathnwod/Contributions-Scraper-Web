import React, { useState } from 'react'
import './exportSettingsModal.css'
import ExcelIcon from './excel-icon.svg'


function ExportSettingsModal( {onClose, results}) {
    const[keyword, setKeyword] = useState('')
    const[keywords, setKeywords] = useState([])
    const [exportStatus, setExportStatus] = useState({mode: '', status: ''}) 
    const [fileName, setFileName] = useState('contributions')


    const handleAddKeyword = (e) => {
        if(e.key === 'Enter' && keyword.trim()) {
            setKeywords([...keywords, keyword.trim()])
            setKeyword('')
        }
    }

const handleExport = async (mode) => {
    if (!results.length) return

    setExportStatus({ mode, status: 'Downloading...'})

    try {
        const response = await fetch('http://127.0.0.1:5000/exportExcel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({results, mode})
        })
        
        // get file as binary blob
        const blob = await response.blob()
        
        // trigger browser download with users chosen filename
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${fileName || 'contributions'}.xlsx`
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)

        setExportStatus({ mode, status: 'Downloaded!' })
        setTimeout(() => setExportStatus({ mode: '', status: '' }), 3000)
    } catch (err) {
        console.error('Error:', err)
        setExportStatus({ mode, status: 'Error downloading' })
    }
}

    const isReady = results.length > 0

    const getSubText = (buttonMode) => {
        // only show status text if this button is the one downloading
        if (exportStatus.mode === buttonMode) {
            if (exportStatus.status === 'Downloading...') return '.xlsx ⋅ in progress'
            if (exportStatus.status === 'Downloaded!') return '.xlsx ⋅ complete'
            if (exportStatus.status === 'Error downloading') return '.xlsx ⋅ failed'
        }
        // else fall back to the idle state
        if (isReady) return '.xlsx ⋅ ready'
        return '.xlsx ⋅ upload files first'
    }

    return (
        <>
            <div className='background-shadow'></div>
            <div className='export-settings-container'>
                <button className='close-export-settings-btn' onClick={onClose}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#242424"><path d="m336-280-56-56 144-144-144-143 56-56 144 144 143-144 56 56-144 143 144 144-56 56-143-144-144 144Z"/></svg>
                </button>

                <div className='export-content-wrapper'>
                    <div className='filename-input-group'>
                        <p className='filename-label'>File name</p>
                        <div className='filename-input-row'>
                            <input
                                className='filename-input'
                                type='text'
                                value={fileName}
                                onChange={(e) => setFileName(e.target.value)}
                                placeholder='contributions'
                            />
                            <span className='filename-extension'>.xlsx</span>
                        </div>
                    </div>

                    <button 
                        className='export-default-excel-btn' 
                        onClick={() => handleExport('default')}
                        // disabled={!isReady}
                    >
                        <img className='excel-icon' src={ExcelIcon} width="32" height="32" />
                        <div className='export-btn-text'>
                            {exportStatus.mode === 'default' && exportStatus.status
                                ? <p>{exportStatus.status}</p>
                                : <span>Export as Excel</span>}
                            <span className='export-btn-sub'>{getSubText('default')}</span>
                        </div>
                    </button>

                    <button 
                        className='export-additional-rows-excel-btn'
                        onClick={() => handleExport('expanded')}
                    >
                        <img className='excel-icon' src={ExcelIcon} width="32" height="32" />
                        <div className='export-btn-text'>
                            {exportStatus.mode === 'expanded' && exportStatus.status
                                ? <p>{exportStatus.status}</p>
                                : <span>Export as Excel (expanded)</span>}
                            <span className='export-btn-sub'>{getSubText('expanded')}</span>
                        </div>
                    </button>

                    <div className='keyword-input-group'>
                        <p className='search-text'>
                            <span className='search-text-label'>Search for Keywords</span>
                            <svg className='search-svg' xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#242424"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>
                        </p>
                        <input 
                            className='keyword-input'
                            type="text" 
                            placeholder="Add a keyword"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={handleAddKeyword}
                        />
                    </div>

                    <div className="keywords-container">
                        {keywords.map((keyword, index) => (
                            <div className='keyword-tag' key={index}>
                                {keyword}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

export default ExportSettingsModal