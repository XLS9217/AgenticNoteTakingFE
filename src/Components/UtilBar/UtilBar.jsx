import { useState } from 'react';
import LiquidGlassDiv from '../LiquidGlassDiv.jsx';
import MinimalismToolTip from '../MinimalismToolTip.jsx';
import { useUtilBar } from './UtilBarProvider.jsx';
import '../Components.css';

export default function UtilBar() {
  const { items } = useUtilBar();
  const [activeKey, setActiveKey] = useState('user');
  const [hoveredKey, setHoveredKey] = useState(null);

  const handleClick = (item) => {
    setActiveKey(item.key);
    if (item.action) {
      item.action();
    }
  };

  return (
    <div className="util-bar util-bar--side">
      <LiquidGlassDiv blurriness={0.5}>
        <nav className="util-bar-nav util-bar-nav--vertical">
          {items.map((item) => (
            <MinimalismToolTip key={item.key} text={item.label}>
              <button
                className={`util-bar-item ${activeKey === item.key ? 'util-bar-item--active' : ''}`}
                onClick={() => handleClick(item)}
                onMouseEnter={() => setHoveredKey(item.key)}
                onMouseLeave={() => setHoveredKey(null)}
                type="button"
                aria-label={item.label}
              >
                <span
                  className={`util-bar-icon-circle ${hoveredKey === item.key && item.hoverClass ? item.hoverClass : ''}`}
                >
                  <img src={item.icon} alt="" className="util-bar-icon-image" />
                </span>
              </button>
            </MinimalismToolTip>
          ))}
        </nav>
      </LiquidGlassDiv>
    </div>
  );
}
