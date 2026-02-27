import TeamHeader from './TeamHeader'
import Settlers from './Settlers'
import PlayerSectors from './PlayerSectors'
import BluePanel from './BluePanel'

export default function BluePanel() {
    return (
        <>
            <TeamHeader teamName="Blue" classString="blue" />
            <Settlers count="1000" />
            <PlayerSectors />
        </>
    )
}