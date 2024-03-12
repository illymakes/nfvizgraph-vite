import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './App.css';
import Graph from './Graph';

function App() {

  return (
    <div className="container-fluid">
      <div className="row">
        New build.
      </div>
      <div className="row">
        <div className="App">
          <Graph />
        </div>
      </div>
    </div>
  );
}

export default App;
