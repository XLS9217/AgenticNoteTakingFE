import { useState } from 'react';
import './Components.css';

export default function MinimalismToolTip({ children, text }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="minimalism-tooltip-container"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && text && (
        <div className="minimalism-tooltip">
          {text}
        </div>
      )}
    </div>
  );
}
