import { useState } from 'react'
import LiquidGlassDiv from '../LiquidGlassDiv.jsx'
import { useUtilBar } from './UtilBarProvider.jsx'
import '../Components.css'
import {InjectableTooltip} from "../InjectableTooltip .jsx";

export default function UtilBar() {
    const { items } = useUtilBar()
    const [activeKey, setActiveKey] = useState('user')
    const [hoveredKey, setHoveredKey] = useState(null)

    const handleClick = (item) => {
        setActiveKey(item.key)
        if (item.action) item.action()
    }

    return (
        <div className="util-bar util-bar--side">
            <LiquidGlassDiv blurriness={0.5}>
                <nav className="util-bar-nav util-bar-nav--vertical">
                    {items.map((item) => (
                        <button
                            key={item.key}
                            data-tooltip-id={`util-${item.key}`}
                            data-tooltip-content={item.label}
                            className={`util-bar-item ${
                                activeKey === item.key ? 'util-bar-item--active' : ''
                            }`}
                            onClick={() => handleClick(item)}
                            onMouseEnter={() => setHoveredKey(item.key)}
                            onMouseLeave={() => setHoveredKey(null)}
                            type="button"
                            aria-label={item.label}
                        >
                            <span
                                className={`util-bar-icon-circle ${
                                    hoveredKey === item.key && item.hoverClass ? item.hoverClass : ''
                                }`}
                            >
                                <img src={item.icon} alt="" className="util-bar-icon-image" />
                            </span>
                        </button>
                    ))}
                </nav>
            </LiquidGlassDiv>
            {items.map((item) => (
                <InjectableTooltip key={`tooltip-${item.key}`} id={`util-${item.key}`} text={item.label} place="right" />
            ))}
        </div>
    )
}
