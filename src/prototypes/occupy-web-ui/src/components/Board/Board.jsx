import Sector from "../Sector/Sector"

export default function Board() {
    return  (
        <div className="board-grid">
            <div className="column">
                <Sector sectorId="0-0" />
                <Sector sectorId="1-0" />
                <Sector sectorId="2-0" />
                <Sector sectorId="3-0" />
                <Sector sectorId="4-0" />
            </div>
            <div className="column">
                <Sector sectorId="0-1" />
                <Sector sectorId="1-1" />
                <Sector sectorId="2-1" />
                <Sector sectorId="3-1" />
                <Sector sectorId="4-1" />
            </div>
            <div className="column">
                <Sector sectorId="0-2" />
                <Sector sectorId="1-2" />
                <Sector sectorId="2-2" />
                <Sector sectorId="3-2" />
                <Sector sectorId="4-2" />
            </div>
            <div className="column">
                <Sector sectorId="0-3" />
                <Sector sectorId="1-3" />
                <Sector sectorId="2-3" />
                <Sector sectorId="3-3" />
                <Sector sectorId="4-3" />
            </div>
            <div className="column">
                <Sector sectorId="0-4" />
                <Sector sectorId="1-4" />
                <Sector sectorId="2-4" />
                <Sector sectorId="3-4" />
                <Sector sectorId="4-4" />
            </div>
        </div>
    )
}