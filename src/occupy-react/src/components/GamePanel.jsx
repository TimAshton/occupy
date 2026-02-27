import Grid from './Grid'
import GameMessage from './GameMessage'
import GameActions from './GameActions'

export default function GamePanel() {
    return (
        <>
            <Grid />
            <GameMessage />
            <GameActions />
        </>
    )
}