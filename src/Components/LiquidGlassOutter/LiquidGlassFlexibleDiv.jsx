import { useState, useRef, useEffect } from 'react';
import { usePanelLayoutBar } from '../PanelLayoutBar/PanelLayoutBarProvider.jsx';
import '../Components.css';

function LiquidGlassFlexibleDiv({ children, blurriness = 0.0, isButton = false, variant = null }) {
  const { startDragging, updateDragPosition, stopDragging } = usePanelLayoutBar();
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const startMousePos = useRef({ x: 0, y: 0 });

  const lerp = (start, end, t) => start + (end - start) * t;

  // Normal state values
  const normal = {
    backgroundOpacity: 0.05,
    blur: 20,
    saturation: 180,
    borderOpacity: 0.18,
    shadowIntensity: 1
  };

  // Hover state values (without transform)
  const hover = {
    backgroundOpacity: 0.15,
    blur: 25,
    saturation: 200,
    borderOpacity: 0.25,
    shadowIntensity: 1.5
  };

  // Interpolated values
  const backgroundOpacity = lerp(normal.backgroundOpacity, hover.backgroundOpacity, blurriness);
  const blur = lerp(normal.blur, hover.blur, blurriness);
  const saturation = lerp(normal.saturation, hover.saturation, blurriness);
  const borderOpacity = lerp(normal.borderOpacity, hover.borderOpacity, blurriness);
  const shadowIntensity = lerp(normal.shadowIntensity, hover.shadowIntensity, blurriness);

  const handleDragStart = (e) => {
    e.preventDefault();
    if (!containerRef.current) return;

    // Record starting mouse position
    startMousePos.current = { x: e.clientX, y: e.clientY };

    setIsDragging(true);
    startDragging({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    // Calculate delta from starting position
    const deltaX = e.clientX - startMousePos.current.x;
    const deltaY = e.clientY - startMousePos.current.y;

    setPosition({ x: deltaX, y: deltaY });
    updateDragPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    setIsDragging(false);
    stopDragging();

    // Animate back to original position
    setPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const className = `liquid-glass-container liquid-glass-container--flexible ${isButton ? 'liquid-glass-container--button' : 'liquid-glass-container--static'} ${variant ? `liquid-glass-container--${variant}` : ''} ${isDragging ? 'liquid-glass-container--dragging' : ''}`;
  const containerStyle = {
    background: `rgba(255, 255, 255, ${backgroundOpacity})`,
    backdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
    WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
    border: `1px solid rgba(255, 255, 255, ${borderOpacity})`,
    boxShadow: `
      0 ${8 * shadowIntensity}px ${32 * shadowIntensity}px rgba(0, 0, 0, ${0.12 * shadowIntensity}),
      0 ${2 * shadowIntensity}px ${6 * shadowIntensity}px rgba(0, 0, 0, ${0.08 * shadowIntensity}),
      inset 0 1px 0 rgba(255, 255, 255, ${0.15 + (0.05 * blurriness)}),
      inset 0 -1px 0 rgba(0, 0, 0, ${0.05 + (0.03 * blurriness)})
    `,
    transform: isDragging ? `translate(${position.x}px, ${position.y}px)` : 'translate(0, 0)',
    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: isDragging ? 'grabbing' : 'default',
    userSelect: isDragging ? 'none' : 'auto',
    WebkitUserSelect: isDragging ? 'none' : 'auto',
    zIndex: isDragging ? 9999 : 'auto'
  };

  return (
    <div ref={containerRef} className={className} style={containerStyle}>
      <div
        className="liquid-glass-drag-handle"
        onMouseDown={handleDragStart}
      />
      <div style={{ position: 'relative', zIndex: 2, height: '100%' }}>
        {children}
      </div>
    </div>
  );
}

export default LiquidGlassFlexibleDiv;