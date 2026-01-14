import { useState } from "react"; 

export default function Sector(props) {

    const [ status, setStatus ] = useState(0);
    
    function handleSectorClick() {
        alert(`${props.sectorId} - ${status}`);
    }

    return (
        <div id="{props.sectorId}" className="sector" onClick={ handleSectorClick } />
    )
}