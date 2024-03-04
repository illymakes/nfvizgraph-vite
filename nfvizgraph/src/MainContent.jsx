import React from 'react';
import GraphComponent from './GraphComponent';

const MainContent = ({ graphData }) => {
    return (
        <div className="main-content">
            {/* Render GraphComponent with the provided graphData */}
            <GraphComponent graphData={graphData} />
        </div>
    );
};

export default MainContent;
