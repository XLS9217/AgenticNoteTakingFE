import { useState } from 'react';
import LiquidGlassDiv from './LiquidGlassDiv.jsx';
import './Components.css';

const navItems = [
  { key: 'user', icon: '/icon_user.png', label: 'User' },
  { key: 'workspace', icon: '/icon_ws.png', label: 'Workspace' },
  { key: 'background', icon: '/icon_bg.png', label: 'Change Background' },
  { key: 'settings', icon: '/icon_setting.png', label: 'Setting' },
  { key: 'logout', icon: '/icon_logout.png', label: 'Logout' }
];

export default function UtilBar({ onAction }) {
  const [activeKey, setActiveKey] = useState('user');

  const handleClick = (itemKey) => {
    setActiveKey(itemKey);
    if (typeof onAction === 'function') {
      onAction(itemKey);
    }
  };

  return (
    <div className="util-bar util-bar--top">
      <LiquidGlassDiv blurriness={0.5}>
        <nav className="util-bar-nav util-bar-nav--horizontal">
          {navItems.map(({ key, icon, label }) => (
            <button
              key={key}
              className={`util-bar-item ${activeKey === key ? 'util-bar-item--active' : ''}`}
              onClick={() => handleClick(key)}
              type="button"
              title={label}
              aria-label={label}
            >
              <span className="util-bar-icon-circle">
                <img src={icon} alt="" className="util-bar-icon-image" />
              </span>
            </button>
          ))}
        </nav>
      </LiquidGlassDiv>
    </div>
  );
}
