import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './App.css';
import CsvUploadModal from './CsvUploadModal';
import InfoOverlay from './InfoOverlay';

function App() {
  const [isCsvModalOpen, setCsvModalOpen] = useState(false);
  const [isInfoOverlayOpen, setInfoOverlayOpen] = useState(false);
  const [csvData, setCsvData] = useState([]);

  const toggleCsvModal = () => setCsvModalOpen(!isCsvModalOpen);
  const toggleInfoOverlay = () => setInfoOverlayOpen(!isInfoOverlayOpen);

  const handleCsvProcessed = (parsedData) => {
    setCsvData(parsedData);
    // Here update the state with the parsed CSV data
  };

  const [graphData, setGraphData] = useState([]);

  //placeholder function to simulate fetching or updating graph data
  const updateGraphData = (newData) => {
    setGraphData(newData);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar onUploadClick={() => { }} onInfoClick={() => { }} />
        <MainContent graphData={graphData} />
        <CsvUploadModal isOpen={isCsvModalOpen} onClose={toggleCsvModal} onCsvProcessed={handleCsvProcessed} />
        <InfoOverlay isOpen={isInfoOverlayOpen} onClose={toggleInfoOverlay} />
      </div>
    </div>
  );
}

export default App;
