import TeamHeader from './TeamHeader'
import Settlers from './Settlers'
import PlayerSectors from './PlayerSectors'
import RedPanel from './RedPanel'

export default function RedPanel() {
    return (
        <>
            <TeamHeader teamName="Red" classString="red" />
            <Settlers count="1001" />
            <PlayerSectors />
        </>
    )
}