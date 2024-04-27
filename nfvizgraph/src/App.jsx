import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import FileUploadIcon from '@mui/icons-material/FileUploadOutlined';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlotOutlined';
import TableChartIcon from '@mui/icons-material/TableChartOutlined';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import './App.css';
import Graph from './Graph';
import UploadModal from './UploadModal';

function App() {
  const [isUploadModalVisible, setUploadModalVisible] = useState(false);
  const [isAppVisible, setIsAppVisible] = useState(false);


  const handleUploadClick = () => {
    setUploadModalVisible(true);
  };

  const handleCloseModal = () => {
    setUploadModalVisible(false);
  };

  const handleFileUpload = (input) => {
    // Check if input is a File object
    if (input instanceof File) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvData(event.target.result);
      };
      reader.readAsText(input);
    } else if (typeof input === 'string') {
      setCsvData(input);
    }
    handleCloseModal();
    setIsAppVisible(true);
  };

  return (
    <div className="container-fluid">
      <div className="row h-100 flex-nowrap">
        <div className="col-md-2 side-menu d-flex flex-column justify-content-center align-items-center" style={{ padding: '2px' }}>
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
            <div className="menu-button-1 text-center">
              <ScatterPlotIcon className="icon-button my-2" style={{ fontSize: '36px' }} />
              <p style={{ fontSize: '12px' }}>
                plot
              </p>
            </div>
            <div className="menu-button-1 text-center">
              <TableChartIcon className="icon-button my-2" style={{ fontSize: '36px' }} />
              <p style={{ fontSize: '12px' }}>
                table
              </p>
            </div>
          </div>
          <div className="bottom-button mt-auto mb-3">
            <InfoIcon className="icon-button my-2" />
          </div>
        </div>
        <div className="col-md-10 app-graph-div">
          <div className="App bg-dark">
            <Graph />
          </div>
        </div>
      </div>
      <UploadModal
        isVisible={isUploadModalVisible}
        onClose={handleCloseModal}
        onFileUpload={handleFileUpload}
      />
    </div >
  );
}

export default App;
