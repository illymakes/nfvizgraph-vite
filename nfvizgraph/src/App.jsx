import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './App.css';
import CsvUploadModal from './CsvUploadModal';

function App() {
  const [isCsvModalOpen, setCsvModalOpen] = useState(false);
  const [csvData, setCsvData] = useState([]);

  const toggleCsvModal = () => setCsvModalOpen(!isCsvModalOpen);

  const handleCsvProcessed = (parsedData) => {
    console.log(parsedData);
    setCsvData(parsedData);
    // Here update the state with the parsed CSV data
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar onUploadClick={toggleCsvModal} />
        <MainContent />
        <CsvUploadModal isOpen={isCsvModalOpen} onClose={toggleCsvModal} onCsvProcessed={handleCsvProcessed} />
      </div>
    </div>
  );
}

export default App;
