import './Components.css'

function LiquidGlassInnerTextButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="liquid-glass-text-button"
    >
      {children}
    </button>
  )
}

export default LiquidGlassInnerTextButton
