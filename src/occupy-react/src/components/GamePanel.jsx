import Grid from './Grid'
import GameMessage from './GameMessage'
import GameActions from './GameActions'

import { useState } from 'react'

export default function GamePanel() {

    const [gameMessage, setGameMessage] = useState()

    return (
        <>
            <Grid />
            <GameActions />
            { gameMessage ? <GameMessage /> : undefined }
        </>
    )
}