import BluePanel from './BluePanel'
import GamePanel from './GamePanel'
import RedPanel from './RedPanel'

export default function Board() {
    return (
        <div className="container">
            <div className="column">
                <BluePanel />
            </div>
            <div className="column">
                <GamePanel />
            </div>
            <div className="column">
                <RedPanel />
            </div>
        </div>    
    )
}