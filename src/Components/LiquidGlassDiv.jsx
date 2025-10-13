import './Components.css'

function LiquidGlassDiv({ children}) {
  return (
    <div className={`liquid-glass-container`}>
      {children}
    </div>
  )
}

export default LiquidGlassDiv