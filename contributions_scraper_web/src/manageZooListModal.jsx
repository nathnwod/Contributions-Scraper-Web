import { useState, useEffect } from "react"
import "./manageZooListModal.css"

function ManageZooListModal({onClose}){
    const [institutions, setInstitutions] = useState([])

    useEffect(() => {
        fetch('http://127.0.0.1:5000/institutions')
            .then(response => response.json())
            .then(list => setInstitutions(list))
    }, [])

    function deleteInstitution(removeIndex) {
        setInstitutions(prev =>
            prev.filter((_, index) => index !== removeIndex)
        );
    };



    return (
        <>
        <div className="background-shadow"></div>
        <div className="manage-zoolist-container">
            <button className="close-zoolist-btn" onClick={onClose}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#242424"><path d="m336-280-56-56 144-144-144-143 56-56 144 144 143-144 56 56-144 143 144 144-56 56-143-144-144 144Z"/></svg>
            </button>

            <div className="content-wrapper">
                <h2 className="manage-zoolist-header">Manage zoo/aquarium list</h2>
                <h3 className="manage-zoolist-subheader">Add or remove insitutions to compare against.</h3>
                <div className="separator-line"></div>

                <div className="add-institution-wrapper">
                    <input
                            type='text'
                            defaultValue=''
                            placeholder="Add an institution"
                    />
                    <button className="add-institution-btn">
                        <span>Add</span>
                    </button>
                </div>
                <div className="separator-line"></div>

                <div className="import-export-institutions-wrapper">
                    <h3>{institutions.length} institution(s)</h3>
                    <div className="import-export-btn-wrapper">
                        <button className="import-institutions-btn">Import</button>
                        <button className="export-institutions-btn">Export</button>
                    </div>
                </div>

                <div className="zoo-aquarium-list">
                    {institutions.map((institution, index) => (
                        <div className='institution' key={index}>{institution}
                            <button className="delete-institution-btn" onClick={() => deleteInstitution(index)}>
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#242424"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
                            </button>
                        </div>
                    ))}
                </div>

            </div>

        </div>
        </>
    )
}
     

export default ManageZooListModal