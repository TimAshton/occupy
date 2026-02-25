import TeamHeader from './TeamHeader'
import Settlers from './Settlers'
import Grid from './Grid'
import GameMessage from './GameMessage'
import GameActions from './GameActions'
import PlayerSectors from './PlayerSectors'

export default function Board() {
    return (
        <div className="container">
            <div className="column">
                <TeamHeader teamName="Blue" classString="blue" />
                <Settlers count="1000" />
                <PlayerSectors />
            </div>
            <div className="column">
                <Grid />
                <GameMessage />
                <GameActions />
            </div>
            <div className="column">
                <TeamHeader teamName="Red" classString="red" />
                <Settlers count="1001" />
                <PlayerSectors />
            </div>
        </div>    
    )
}