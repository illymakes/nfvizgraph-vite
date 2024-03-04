import React from 'react';
import './sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faTable, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

function Sidebar({ onUploadClick }) {

    return (
        <nav className="col-2 sidebar d-md-block">
            <div className="d-flex flex-column h-100">
                <ul className="nav flex-column mb-auto" id="nav-icons">
                    <img src="#" alt="Logo" id="nfvLogo" />
                    <img src="#" alt="Logo Text" id="nfvLogoText" />
                    <h6 className="mt-2 text-center title-font">nfvizgraph</h6>
                    <div className="nav-icons">
                        <li className="nav-item text-center">
                            <button className="nav-link active glow" id="upload-icon" onClick={onUploadClick}>
                                <FontAwesomeIcon icon={faUpload} />
                                <p style={{ fontSize: "12px" }}>upload</p>
                            </button>
                        </li>
                        <li className="nav-item text-center">
                            <button className="nav-link active" id="chart-icon" >
                                <img src="./img/chart-scatter.svg" id="chart-icon-svg" alt="Plot" />
                                <p style={{ fontSize: "12px" }}>plot</p>
                            </button>
                        </li>
                        <li className="nav-item text-center">
                            <button className="nav-link active" id="table-icon" >
                                <FontAwesomeIcon icon={faTable} />
                                <p style={{ fontSize: "12px" }}>table</p>
                            </button>
                        </li>
                    </div>
                </ul>
                <ul className="nav flex-column bottomOverlayUl">
                    <li className="nav-item mt-auto text-center">
                        <button className="nav-link" id="openOverlayLink" style={{ fontSize: "12px" }}>
                            <FontAwesomeIcon icon={faInfoCircle} />
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default Sidebar;