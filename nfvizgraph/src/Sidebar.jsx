import React, { forwardRef } from 'react';

const Sidebar = forwardRef(({ isVisible, content, onClose }, ref) => {
  const sidebarStyle = {
    width: '400px',
    position: 'fixed',
    right: isVisible ? '0' : '-400px',
    top: '0',
    height: '100vh',
    backgroundColor: '#1a1a1a',
    transition: 'right 0.3s ease-in-out',
    padding: '20px',
    color: 'white',
    overflowY: 'auto',
    paddingTop: '45px',
    paddingLeft: '18px'
  };

  return (
    <div ref={ref} style={sidebarStyle}>
      <span onClick={onClose} className="close-sidebar" style={{ marginBottom: '10px' }}>×</span>
      <div dangerouslySetInnerHTML={{ __html: content }}></div>
    </div>
  );
});

export default Sidebar;
