import React, { useState } from 'react';

const CsvUploadModal = ({ isOpen, onClose, onCsvProcessed }) => {
    // Local state for file handling
    const [dragOver, setDragOver] = useState(false);
    const [csvText, setCsvText] = useState('');

    // Function to process file
    const processFile = (file) => {
        const reader = new FileReader();
        reader.onload = () => {
            const csvData = reader.result;
            const parsedData = d3.csvParse(csvData);

            onCsvProcessed(parsedData);

            // Resetting state and closing modal
            setCsvText('');
            onClose();
        };
        reader.readAsText(file);
    };

    // Handle file drop
    const handleDrop = (event) => {
        event.preventDefault();
        setDragOver(false);

        const file = event.dataTransfer.files[0];
        if (file && file.type === 'text/csv') {
            processFile(file);
        } else {
            alert('Please upload a valid CSV file.');
        }
    };

    // Handle file selection via input
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'text/csv') {
            processFile(file);
        } else {
            alert('Please upload a valid CSV file.');
        }
    };

    // Handle text area change
    const handleTextChange = (event) => {
        setCsvText(event.target.value);
    };

    // Process text input as CSV
    const handleSubmit = () => {
        const parsedData = d3.csvParse(csvText);
        onCsvProcessed(parsedData);
        setCsvText('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div id="overlayCSV">
            <div className="modal">
                <span className="close" onClick={onClose}>&times;</span>
                <div
                    id="drag-drop-area"
                    className={dragOver ? 'dragover' : ''}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                >
                    Drag and drop your CSV here or click <span id="browse-button">browse</span>.
                </div>
                <input
                    type="file"
                    id="file-input"
                    accept=".csv"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
                <textarea
                    id="csvInput"
                    placeholder="Paste your CSV data here."
                    value={csvText}
                    onChange={handleTextChange}
                ></textarea>
                <button id="modalBtn" onClick={handleSubmit}>Submit</button>
            </div>
        </div>
    );
};

export default CsvUploadModal;
