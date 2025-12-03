import './Components.css'

function Background({ children }) {
  return (
    <div className="background-container">
      {children}
      <img src="/polybg3.jpg" alt="Background" className="background-image" />
    </div>
  )
}

export default Background