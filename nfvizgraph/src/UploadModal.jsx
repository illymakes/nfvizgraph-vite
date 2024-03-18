import React from 'react';

const UploadModal = ({ isVisible, onClose, onFileUpload }) => {
  if (!isVisible) return null;

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="upload-modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <p>Or drop a CSV file here.</p>
      </div>
    </div>
  );
};

export default UploadModal;