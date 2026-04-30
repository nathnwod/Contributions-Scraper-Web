import { useState, useEffect, useRef } from "react"
import "./manageZooListModal.css"

function ManageZooListModal({onClose, onSaved}){
    const [institutions, setInstitutions] = useState([])
    const [institutionToAdd, setInstitutionToAdd] = useState('')
    const fileInputRef = useRef(null)
    const [isSaving, setIsSaving] = useState(false)
    const [importOptionsIsOpen, setImportOptionsIsOpen] = useState(false)
    const [importMode, setImportMode] = useState('replace')


    async function restoreDefault() {
        const res = await fetch('http://127.0.0.1:5000/institutions/default')
        const list = await res.json()
        setInstitutions([...new Set(list)])
    }

    async function loadInstitutions() {
        const res = await fetch('http://127.0.0.1:5000/institutions')
        const list = await res.json()
        setInstitutions([...new Set(list)])
    }

    useEffect(() => {
        loadInstitutions()
    }, [])

    async function handleSave() {
        setIsSaving(true)
        try {
            await fetch('http://127.0.0.1:5000/institutions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(institutions)
            })
            if (onSaved) await onSaved()
            onClose()
        }  catch (err) {
            setIsSaving(false)
        }
    }

    
    function deleteInstitution(name) {
        setInstitutions(prev => prev.filter(institution => institution !== name));
    }

    function addInstitution() {
        const trimmed = institutionToAdd.trim()
        const normalized = trimmed.toLowerCase()
        if (normalized && !institutions.some(inst => inst.toLowerCase() === normalized)) {
            setInstitutions(prev => [trimmed, ...prev])
            setInstitutionToAdd('')
        }
    }

    async function handleImport(e) {
        const file = e.target.files[0]
        if (!file) return

        const text = await file.text()
        const lines = text
            .replace(/^\uFEFF/, '')  
            .split('\n')
            .map(line => line.trim())
            .filter(line => line)


        // dedup the new file
        const seen = new Set()
        const unique = lines.filter(line => {
        const key = line.toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
    })

    if (importMode === 'replace') {
        setInstitutions(unique)
    } else if (importMode === 'merge') {
        setInstitutions(prev => {
            const combined = [...unique, ...prev]
            const merged = new Set()
            return combined.filter(line => {
                const key = line.toLowerCase()
                if (merged.has(key)) return false
                merged.add(key)
                return true
            })
        })
    }

    e.target.value = ''
}


    function exportTxtFile() {
        console.log("function ran...")
        const text = institutions.join('\n')
        const blob = new Blob([text], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = 'institutions.txt'
        link.click()

        URL.revokeObjectURL(url)
    }






    return (
        <>
        <div className="background-shadow"></div>
        <div className="manage-zoolist-container">
            <button className="close-zoolist-btn" onClick={onClose}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#242424"><path d="m336-280-56-56 144-144-144-143 56-56 144 144 143-144 56 56-144 143 144 144-56 56-143-144-144 144Z"/></svg>
            </button>

            <div className="content-wrapper">
                <h2 className="manage-zoolist-header">Manage zoo/aquarium list</h2>
                <h4>Default list generated from "Leon's World Map of Parks, Zoos and Aquariums".</h4>
                <div className="whitespace"></div>
                <h3 className="manage-zoolist-subheader">Add or remove institutions to compare against.</h3>
                
                <div className="separator-line"></div>

                <div className="add-institution-wrapper">
                    <input className="add-institution-input"
                            type='text'  
                            value={institutionToAdd}
                            placeholder="Add an institution"
                            onChange={(e) => setInstitutionToAdd(e.target.value)}
                    />
                    <button 
                        className="add-institution-btn"
                        onClick={addInstitution}>
                        <span>Add</span>
                    </button>
                </div>

                <div className="separator-line"></div>

                <div className="import-export-institutions-wrapper">
                    <h3 
                        className="info-wrapper"
                        >
                        {institutions.length} institution(s) 
                    </h3>
                    <div className="import-export-btn-wrapper">
                        <input 
                            type="file"
                            accept=".txt"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleImport}
                        />
                        <div className="import-btn-wrapper">
                            <button 
                                className="import-institutions-btn"
                                onClick={() => setImportOptionsIsOpen(true)}
                                >
                                    Import .txt
                            </button>

                        {importOptionsIsOpen && ( 
                            <>
                            <div className="background-shadow-2"></div> 
                            <div className="import-popup-box">
                                
                                <div className="checkbox-wrapper">
                                    <label>
                                        <input 
                                            type="radio"
                                            name="importMode"
                                            value="merge"
                                            checked={importMode === 'merge'}
                                            onChange={(e) => setImportMode(e.target.value)}
                                
                                         />
                                        &nbsp;Merge List
                                    </label>
                                    <label>
                                        <input 
                                             type="radio"
                                            name="importMode"
                                            value="replace"
                                            checked={importMode === 'replace'}
                                            onChange={(e) => setImportMode(e.target.value)}
                                        />
                                        &nbsp;Replace List
                                    </label>
                                </div>
                                <button onClick={() => {
                                    setImportOptionsIsOpen(false)
                                    fileInputRef.current.click()
                                }}>Import</button>
                                <button onClick={() => setImportOptionsIsOpen(false)}>Cancel</button>
                            </div>
                            </>
                        )}
                        </div>
                        

                        <button 
                            className="export-institutions-btn"
                            onClick={exportTxtFile}
                            >
                                Export .txt
                        </button>
                    </div>
                </div>

                <div className="zoo-aquarium-list">
                    {institutions.map((institution, index) => (
                        <div className='institution' key={institution}>{institution}
                            <button className="delete-institution-btn" onClick={() => deleteInstitution(institution)}>
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#242424"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
                            </button>
                        </div>
                    ))}
                </div>

                <div className="separator-line"></div>


                <div className="cancel-save-btn-wrapper">
                    <button 
                        className="reset-default-btn"
                        onClick={restoreDefault}
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#242424"><path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z"/></svg>
                        <span>Restore Default</span>
                    </button>

                    <button className="cancel-edits-btn" onClick={onClose} disabled={isSaving}>Cancel</button>

                    <button 
                        className="save-edits-btn"
                        onClick={handleSave}
                        disabled={isSaving}
                        >
                        {isSaving ? <span className="saving-dots">Scraping</span> : 'Save Changes'}
                    </button>
                </div>

            </div>

        </div>
        </>
    )
}
     

export default ManageZooListModal