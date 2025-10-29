import './App.css'
import Background from './Components/Background'
import LiquidGlassDiv from "./Components/LiquidGlassOutter/LiquidGlassDiv.jsx";
import Application from "./Modules/Application.jsx";

function App() {

  return (
      <>
          <Background>
              <Application />
          </Background>
      </>
  )
}

export default App
