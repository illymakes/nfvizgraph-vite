import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
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
