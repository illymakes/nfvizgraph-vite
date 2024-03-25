import React from 'react';

function Tooltip({ visible, content, position }) {
  if (!visible) {
    return null;
  }

  const style = {
    position: 'absolute',
    top: position.y,
    left: position.x,
    backgroundColor: 'white',
    color: '#121212',
    border: '1px solid black',
    padding: '10px',
    borderRadius: '5px',
    pointerEvents: 'none',
    zIndex: 100,
  };

  return (
    <div style={style}>
      {Object.keys(content).map(key => (
        <div key={key}>
          <strong>{key}:</strong> {content[key]}
        </div>
      ))}
    </div>
  );
}

export default Tooltip;
