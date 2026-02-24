import Header from './components/Header'
import Sector from './components/Sector'
import TeamHeader from './components/TeamHeader'
import Settlers from './components/Settlers'

function App() {
  return (
    <>
      <Header />
        <div className="container">
            <div className="column">
                <TeamHeader teamName="Blue" classString="blue" />
                <Settlers count="1000" />
                <div>Sectors: 0</div>
            </div>
            <div className="column">
                <div>
                    <div className="grid-container">
                        <Sector sectorId='1' />
                        <Sector sectorId='2' />
                        <Sector sectorId='3' />
                        <Sector sectorId='4' />
                        <Sector sectorId='5' />
                        <Sector sectorId='6' />
                        <Sector sectorId='7' />
                        <Sector sectorId='8' />
                        <Sector sectorId='9' />
                        <Sector sectorId='10' />
                        <Sector sectorId='11' />
                        <Sector sectorId='12' />
                        <Sector sectorId='13' />
                        <Sector sectorId='14' />
                        <Sector sectorId='15' />
                        <Sector sectorId='16' />
                        <Sector sectorId='17' />
                        <Sector sectorId='18' />
                        <Sector sectorId='19' />
                        <Sector sectorId='20' />
                        <Sector sectorId='21' />
                        <Sector sectorId='22' />
                        <Sector sectorId='23' />
                        <Sector sectorId='24' />
                        <Sector sectorId='25' />
                    </div>
                </div>
                <div>game message</div>
                <div>game actions</div>
                <div>
                    <button>New Game</button>
                </div>
            </div>
            <div className="column">
                <TeamHeader teamName="Red" classString="red" />
                <Settlers count="1001" />
                <div>Sectors: 0</div>
            </div>
        </div>
    </>
  )
}

export default App
