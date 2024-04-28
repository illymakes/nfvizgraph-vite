import React from 'react';

const AlertModal = ({ isVisible, onClose, message }) => {
    if (!isVisible) return null;

    return (
        <div className="upload-modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <p>{message}</p>
                <button id="modal-submit-btn" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default AlertModal;
