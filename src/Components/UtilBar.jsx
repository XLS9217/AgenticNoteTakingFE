import { useState } from 'react';
import LiquidGlassDiv from './LiquidGlassDiv.jsx';
import './UtilBar.css';

export default function UtilBar() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <>
            <div
                className="util-bar-trigger"
                onMouseEnter={() => setIsExpanded(true)}
            />
            <div
                className={`util-bar ${isExpanded ? 'util-bar--expanded' : ''}`}
                onMouseLeave={() => setIsExpanded(false)}
            >
                <LiquidGlassDiv blurriness={0.3}>
                    <nav className="util-bar-nav">
                        <button className="util-bar-item util-bar-item--active">
                            <span className="util-bar-icon">🏠</span>
                            {isExpanded && <span className="util-bar-label">Home</span>}
                        </button>
                        <button className="util-bar-item">
                            <span className="util-bar-icon">📁</span>
                            {isExpanded && <span className="util-bar-label">Projects</span>}
                        </button>
                        <button className="util-bar-item">
                            <span className="util-bar-icon">👤</span>
                            {isExpanded && <span className="util-bar-label">Profile</span>}
                        </button>
                        <button className="util-bar-item">
                            <span className="util-bar-icon">☰</span>
                            {isExpanded && <span className="util-bar-label">Menu</span>}
                        </button>
                    </nav>
                </LiquidGlassDiv>
            </div>
        </>
    );
}
