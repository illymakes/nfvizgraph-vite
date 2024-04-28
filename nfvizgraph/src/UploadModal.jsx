import React, { useRef } from 'react';

const UploadModal = ({ isVisible, onClose, onFileUpload }) => {
  if (!isVisible) return null;

  const fileInputRef = useRef(null);
  const modalContentRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileUpload(file);
    }
  };

  // Below are some of the functions that would be used to handle the file upload functionality but it's been disabled 
  // for the purposes of this prototype.
  
  // const handlePasteData = () => {
  //   const csvData = document.getElementById('csvInput').value;
  //   onFileUpload(csvData);
  // };

  // const triggerFileInputClick = () => {
  //   fileInputRef.current.click();
  // };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      onFileUpload(file);
    }
  };

  const handleBackdropClick = (event) => {
    if (modalContentRef.current && !modalContentRef.current.contains(event.target)) {
      onClose();
    }
  };

  return (
    <div className="upload-modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content" ref={modalContentRef} onClick={e => e.stopPropagation()} >
        <span className="close-upload-modal" onClick={onClose}>×</span>
        <h5>Upload your CSV file:</h5>
        <div className="dropzone" id="drag-drop-area" onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
          Drag and drop your CSV here or click&nbsp;
          <span id="browse-button" style={{ cursor: 'pointer' }}>
            browse
            <span className="browse-tooltip">Function removed for this prototype.</span>
          </span>
        </div>
        <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileChange} ref={fileInputRef} />
        <h5>Or paste in your CSV data:</h5>
        <textarea id="csvInput" placeholder="Paste your CSV data here."></textarea>
        <button id="modal-submit-btn">
          Submit
          <span className="submit-tooltip">Function removed for this prototype.</span>
        </button>
      </div>
    </div>
  );
};

export default UploadModal;