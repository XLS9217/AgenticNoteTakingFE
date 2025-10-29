import { useRef, useLayoutEffect, useState } from 'react'
import '../Components.css'

function LiquidGlassInnerTabDiv({ tabs, activeTab, setActiveTab }) {
  const containerRef = useRef(null)
  const tabRefs = useRef({})
  const [sliderStyle, setSliderStyle] = useState({ width: 0, transform: 'translateX(0px)' })

  useLayoutEffect(() => {
    const activeIndex = tabs.indexOf(activeTab)
    if (activeIndex === -1 || !containerRef.current) return

    const activeTabElement = tabRefs.current[activeTab]
    if (!activeTabElement) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const tabRect = activeTabElement.getBoundingClientRect()

    const offsetX = tabRect.left - containerRect.left
    const width = tabRect.width

    setSliderStyle({
      width: `${width}px`,
      transform: `translateX(${offsetX}px)`
    })
  }, [activeTab, tabs])

  return (
    <div className="liquid-glass-tab-container" ref={containerRef}>
      <div className="liquid-glass-tab-slider" style={sliderStyle} />
      {tabs.map((tab, index) => (
        <div
          key={index}
          ref={(el) => tabRefs.current[tab] = el}
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
