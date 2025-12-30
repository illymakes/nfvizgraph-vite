import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import FileUploadIcon from '@mui/icons-material/FileUploadOutlined';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlotOutlined';
import TableChartIcon from '@mui/icons-material/TableChartOutlined';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import './App.css';
import Graph from './Graph';
import Table from './Table';
import UploadModal from './UploadModal';
import AlertModal from './AlertModal';
import InfoModal from './InfoModal';

function App() {
  const [isUploadModalVisible, setUploadModalVisible] = useState(false);
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [csvData, setCsvData] = useState(null);
  const [currentView, setCurrentView] = useState('graph');
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
  const [selectedGameName, setSelectedGameName] = useState(null);


  const graphStyle = currentView === 'graph' ? { display: 'block' } : { display: 'none' };
  const tableStyle = currentView === 'table' ? { display: 'block' } : { display: 'none' };


  const toggleInfoModal = () => {
    setIsInfoModalVisible(!isInfoModalVisible);
  };

  const handleUploadClick = () => {
    setUploadModalVisible(true);
  };

  const handleCloseModal = () => {
    setUploadModalVisible(false);
  };

  const handleFileUpload = (input) => {
    //This is how the csv file uploaded would normally be handled, but it is disabled for the 
    //purposes of this prototype

    // Check if input is a File object
    // if (input instanceof File) {
    //   const reader = new FileReader();
    //   reader.onload = (event) => {
    //     setCsvData(event.target.result);
    //   };
    //   reader.readAsText(input);
    // } else if (typeof input === 'string') {
    //   setCsvData(input);
    // }
    // handleCloseModal();
    // setIsAppVisible(true);

    setAlertMessage("Function removed for this prototype.");
    setIsAlertModalVisible(true);
  };

  const handlePlotClick = () => {
    setCurrentView('graph');
  };

  const handleTableClick = () => {
    setCurrentView('table');
  };

  return (
    <div className="container-fluid">
      <div
        style={{
          position: 'fixed',
          top: 10,
          right: 10,
          zIndex: 999999,
          padding: '6px 10px',
          background: 'rgba(0,0,0,0.75)',
          color: '#fff',
          fontSize: 12,
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 8,
          pointerEvents: 'none',
        }}
      >
        selected: {selectedGameName ?? 'none'}
      </div>

      <div className="row h-100 flex-nowrap">
        <div
          className="col-md-2 side-menu d-flex flex-column justify-content-center align-items-center"
          style={{ padding: '2px' }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >

          <div className="logo my-3 justify-content-center align-items-center" style={{ maxwidth: '90%' }}>
            <div className="side-menu-logos justify-content-center align-items-center">
              <img src="./img/rocket.svg" alt="Logo" className="img-fluid logoImg" />
            </div>
            <h6 className="mt-2 text-center title-font" style={{ marginTop: '8px' }}>Visualization</h6>
          </div>
          <div className="menu-buttons d-flex flex-column align-items-center my-auto w-100">
            <div className="menu-button-1 text-center" onClick={handleUploadClick}>
              <FileUploadIcon className="icon-button my-2" style={{ fontSize: '36px' }} />
              <p style={{ fontSize: '12px' }}>
                upload
              </p>
            </div>
            <div className="menu-button-1 text-center" onClick={handlePlotClick}>
              <ScatterPlotIcon className="icon-button my-2" style={{ fontSize: '36px' }} />
              <p style={{ fontSize: '12px' }}>
                plot
              </p>
            </div>
            <div className="menu-button-1 text-center" onClick={handleTableClick}>
              <TableChartIcon className="icon-button my-2" style={{ fontSize: '36px' }} />
              <p style={{ fontSize: '12px' }}>
                table
              </p>
            </div>
          </div>
          <div className="bottom-button mt-auto mb-3" onClick={toggleInfoModal}>
            <InfoIcon className="icon-button my-2" />
          </div>
        </div>
        <div className="col-md-10 app-graph-div">
          <div className="App bg-dark">
            <div style={graphStyle}>
              <Graph
                selectedGameName={selectedGameName}
                onSelectGame={setSelectedGameName}
              />
            </div>
            <div className="table-div" style={{ ...tableStyle }}>
              <Table
                csvData={csvData}
                selectedGameName={selectedGameName}
                onSelectGame={setSelectedGameName}
              />
            </div>
          </div>
        </div>
      </div>
      <UploadModal
        isVisible={isUploadModalVisible}
        onClose={handleCloseModal}
        onFileUpload={handleFileUpload}
      />
      <AlertModal
        isVisible={isAlertModalVisible}
        onClose={() => setIsAlertModalVisible(false)}
        message={alertMessage}
      />
      <InfoModal
        isVisible={isInfoModalVisible}
        onClose={toggleInfoModal}
        imageUrl="./img/illymakes_logo_200px.png"
        content={<div>This app was made with ❤️ by <a href='https://illymakes.com/'>illymakes</a>.</div>}
      />
    </div >
  );
}

export default App;
