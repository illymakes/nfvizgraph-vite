import React from 'react';

const Tooltip = ({ visible, content, onClose }) => {
  if (!visible) return null;

  const combinedStyle = {
    position: 'absolute',
      border: '1px solid #ddd',
      background: '#fff',
      padding: '10px',
      pointerEvents: 'auto',
      zIndex: 1000
  };

  return (
    <div style={combinedStyle}
    onClick={(e) => e.stopPropagation()}
    >
      {/* Optionally, add a close button */}
      <button onClick={onClose} style={{ position: 'absolute', top: 0, right: 0 }}>X</button>
      {/* Display data */}
      {Object.keys(content).map(key => (
        <div key={key}>{`${key}: ${content[key]}`}</div>
      ))}
    </div>
  );
};

export default Tooltip;
