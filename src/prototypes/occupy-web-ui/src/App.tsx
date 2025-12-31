import BlueColumn from './components/BlueColumn/BlueColumn'
import RedColumn from './components/RedColumn/RedColumn'
import Board from './components/Board/Board'

import './App.css'

function App() {
  return (
    <>
      <h1>Occupy v0.0</h1>
      <div className="grid" id="game-board">
        <BlueColumn />
        <div id="play-area-col" className="column">
          <Board />
          
        </div>
        <RedColumn />
      </div>
    </>
  )
}

export default App
