import React, {useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css'; // Basic styling
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Theme
import Papa from 'papaparse';

const Table = () => {
    const [columnDefs, setColumnDefs] = useState([]);
    const [rowData, setRowData] = useState([]);

    useEffect(() => {
        fetch('./games.csv')
            .then(response => response.text())
            .then(data => {
                const parsedData = Papa.parse(data, { header: true, dynamicTyping: true, skipEmptyLines: true });
                if (parsedData?.data) {
                    setRowData(parsedData.data);

                    const colDefs = parsedData.meta.fields.map(field => ({
                        headerName: field,
                        field: field,
                        sortable: true,
                        filter: true
                    }));
                    setColumnDefs(colDefs);
                }
            })
            .catch(error => console.error('Error loading or parsing CSV:', error));
    }, []);

    return (
        <div className="ag-theme-alpine-dark" style={{ height: '100%', width: '100%' }}>
            <AgGridReact
                columnDefs={columnDefs}
                rowData={rowData}
                animateRows={true}
            />
        </div>
    );
};

export default Table;
