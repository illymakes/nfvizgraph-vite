import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Graph from './Graph';

function App() {

  return (
    <div className="container-fluid">
      <div className="row h-100">
        <div className="col-md-2 side-menu">
          { /* side menu content goes here */}
        </div>
        <div className="col-md-10 app-graph-div">
          <div className="App bg-dark">
            <Graph />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
