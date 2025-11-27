import './Components.css'

function Background({ children }) {
  return (
    <div className="background-container">
      {children}
      <img src="/lgwp.jpg" alt="Background" className="background-image" />
    </div>
  )
}

export default Background