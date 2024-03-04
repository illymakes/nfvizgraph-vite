import React from 'react';

const InfoOverlay = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="overlay">
            <div className="overlay-content">
                <span className="close" onClick={onClose}>&times;</span>
                <h5>About nfvizgraph-vite</h5>
                <p>THe overlay content goes here. Click X to close this window.</p>
            </div>
        </div>
    );
};

export default InfoOverlay;