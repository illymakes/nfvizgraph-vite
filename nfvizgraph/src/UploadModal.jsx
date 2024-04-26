import React, { useRef } from 'react';
import * as d3 from 'd3';

const UploadModal = ({ isVisible, onClose, onFileUpload }) => {
  if (!isVisible) return null;

  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handlePasteData = () => {
    const csvData = document.getElementById('csvInput').value;
    onFileUpload(csvData);
  };

  const triggerFileInputClick = () => {
    fileInputRef.current.click();
  };

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

  return (
    <div className="upload-modal">
      <div className="modal-content">
        <span className="close-upload-modal" onClick={onClose}>&times;</span>
        <h5>Upload your CSV file:</h5>
        <div className="dropzone" id="drag-drop-area" onDragOver={handleDragOver} onDrop={handleDrop}>
          Drag and drop your CSV here or click&nbsp;
          <span id="browse-button" style={{cursor: 'pointer'}}>browse</span>
        </div>
        <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileChange} ref={fileInputRef} />
        <h5>Or paste in your CSV data:</h5>
        <textarea id="csvInput" placeholder="Paste your CSV data here."></textarea>
        <button id="modal-submit-btn">Submit</button>
      </div>
    </div>
  );
};

export default UploadModal;