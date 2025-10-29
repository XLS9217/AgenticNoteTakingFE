import '../Components.css'

function LiquidGlassDiv({ children, blurriness = 0.0, isButton = false, variant = null }) {
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

  const className = `liquid-glass-container ${isButton ? 'liquid-glass-container--button' : 'liquid-glass-container--static'} ${variant ? `liquid-glass-container--${variant}` : ''}`;
  const style = {
    background: `rgba(255, 255, 255, ${backgroundOpacity})`,
    backdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
    WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
    border: `1px solid rgba(255, 255, 255, ${borderOpacity})`,
    boxShadow: `
      0 ${8 * shadowIntensity}px ${32 * shadowIntensity}px rgba(0, 0, 0, ${0.12 * shadowIntensity}),
      0 ${2 * shadowIntensity}px ${6 * shadowIntensity}px rgba(0, 0, 0, ${0.08 * shadowIntensity}),
      inset 0 1px 0 rgba(255, 255, 255, ${0.15 + (0.05 * blurriness)}),
      inset 0 -1px 0 rgba(0, 0, 0, ${0.05 + (0.03 * blurriness)})
    `
  };

  return (
    <div className={className} style={style}>
      <div style={{ position: 'relative', zIndex: 2, height: '100%' }}>
        {children}
      </div>
    </div>
  )
}

export default LiquidGlassDiv