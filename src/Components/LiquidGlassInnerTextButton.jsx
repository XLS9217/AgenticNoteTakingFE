import './Components.css'

function LiquidGlassInnerTextButton({ children, onClick, title }) {
  return (
    <button
      onClick={onClick}
      className="liquid-glass-text-button"
      title={title}
    >
      {children}
    </button>
  )
}

export default LiquidGlassInnerTextButton
