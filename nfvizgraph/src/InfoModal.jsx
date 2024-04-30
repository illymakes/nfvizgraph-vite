import React from 'react';

const InfoModal = ({ isVisible, onClose, content, imageUrl }) => {
    if (!isVisible) return null;

    const handleBackdropClick = (event) => {
        if (event.currentTarget === event.target) {
            onClose();
        }
    };

    return (
        <div className="upload-modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <span className="close-info-modal" onClick={onClose}>×</span>
                {imageUrl && <img src={imageUrl} alt="illymakes Logo" style={{ maxWidth: '100%' }} />}
                <div className="info-modal-body">{content}</div>
            </div>
        </div>
    );
};

export default InfoModal;
