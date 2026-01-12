import React, { forwardRef } from 'react';
import './LiquidGlassScrollBar.css';

export default forwardRef(function LiquidGlassScrollBar({ children, className = '' }, ref) {
    return (
        <div ref={ref} className={`liquid-glass-scrollbar ${className}`}>
            {children}
        </div>
    );
});
