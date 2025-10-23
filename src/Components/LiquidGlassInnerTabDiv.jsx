import './Components.css'

function LiquidGlassInnerTabDiv({ tabs, activeTab, setActiveTab }) {
  return (
    <div className="liquid-glass-tab-container">
      {tabs.map((tab, index) => (
        <div
          key={index}
          className={`liquid-glass-tab ${activeTab === tab ? 'liquid-glass-tab--active' : ''}`}
          onClick={() => setActiveTab(tab)}
        >
          {tab}
        </div>
      ))}
    </div>
  )
}

export default LiquidGlassInnerTabDiv
