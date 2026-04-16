import React, { useState } from 'react'
import './exportSettingsModal.css'
import ExcelIcon from './excel-icon.svg'


function ExportSettingsModal( {onClose}) {
    const[keyword, setKeyword] = useState('')
    const[keywords, setKeywords] = useState([])

    const handleAddKeyword = (e) => {
        if(e.key === 'Enter' && keyword.trim()) {
            setKeywords([...keywords, keyword.trim()])
            setKeyword('')
        }
    }
    return(
        <>
            <div className='background-shadow'></div>
            <div className='export-settings-container'>
                <button className='close-export-settings-btn' onClick={onClose}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#242424"><path d="m336-280-56-56 144-144-144-143 56-56 144 144 143-144 56 56-144 143 144 144-56 56-143-144-144 144Z"/></svg>
                </button>

                <div className='export-content-wrapper'>
                    <button className='export-default-excel-btn'>
                        <img className='excel-icon' src={ExcelIcon} width="32" height="32" />
                        <span>Export as Excel</span>
                    </button>

                    <button className='export-additional-rows-excel-btn'>
                        <img className='excel-icon' src={ExcelIcon} width="32" height="32" />
                        <span>Export as Excel (expanded)</span>
                    </button>

                    <div className='keyword-input-group'>

                    <p className='search-text'>
                        <span className='search-text-label'>Search for Keywords</span>
                        <svg className='search-svg' xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#242424"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>
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

                    {/* populate keywords array */}
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