import React from 'react';
import './LiquidGlassScrollBar.css';

export default function LiquidGlassScrollBar({ children, className = '' }) {
    return (
        <div className={`liquid-glass-scrollbar ${className}`}>
            {children}
        </div>
    );
}
