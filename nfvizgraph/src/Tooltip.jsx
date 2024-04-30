import React from 'react';

const Tooltip = ({ visible, content, x, y }) => {
  if (!visible) return null;

  const style = {
    position: 'absolute',
    top: `${y}px`,
    left: `${x}px`,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    color: 'white',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '5px 10px',
    pointerEvents: 'none',
    zIndex: 100,
    whiteSpace: 'nowrap',
    fontFamily: "'Roboto Mono', monospace"
  };

  return (
    <div style={style} dangerouslySetInnerHTML={{ __html: content }}></div>
  )
};

export default Tooltip;
