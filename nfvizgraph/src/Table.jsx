import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { themeQuartz } from 'ag-grid-community';
import Papa from 'papaparse';

const Table = ({ selectedGameName, onSelectGame }) => {
  const [columnDefs, setColumnDefs] = useState([]);
  const [rowData, setRowData] = useState([]);

  const gridApiRef = useRef(null);

  const onGridReady = (params) => {
    gridApiRef.current = params.api;
  };

  const onFirstDataRendered = () => {
    // When rows first appear, apply the current selection (if any)
    syncSelectionToGrid(selectedGameName);
  };

  const syncSelectionToGrid = (name) => {
    const api = gridApiRef.current;
    if (!api) return;

    api.deselectAll();

    if (!name) return;

    const rowNode = api.getRowNode(name);
    if (rowNode) {
      api.setNodesSelected({
        nodes: [rowNode],
        newValue: true,
        clearSelection: true,
      });

      api.ensureNodeVisible(rowNode, 'middle');
    }
  };

  // Whenever selectedGameName changes (e.g., from clicking a plot point), update grid selection
  useEffect(() => {
    syncSelectionToGrid(selectedGameName);
  }, [selectedGameName]);

  const gridTheme = useMemo(
    () =>
      themeQuartz.withParams({
        backgroundColor: '#0b0b0f',
        foregroundColor: '#f2f2f7',
        headerBackgroundColor: '#0f0f16',
        headerTextColor: '#f2f2f7',
        borderColor: 'rgba(255,255,255,0.08)',

        rowBackgroundColor: '#0b0b0f',
        oddRowBackgroundColor: '#0d0d14',
        rowHoverColor: 'rgba(255, 0, 255, 0.10)',
        selectedRowBackgroundColor: 'rgba(255, 0, 255, 0.16)',

        accentColor: '#ff00ff',
        checkboxCheckedColor: '#ff00ff',
        rangeSelectionBorderColor: '#ff00ff',
        inputFocusBorderColor: '#ff00ff',

        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        fontSize: 13,
        rowHeight: 42,
        headerHeight: 44,

        inputBackgroundColor: '#0f0f16',
        inputTextColor: '#f2f2f7',
        inputBorderColor: 'rgba(255,255,255,0.12)',
      }),
    []
  );

  useEffect(() => {
    fetch('./games.csv')
      .then((response) => response.text())
      .then((data) => {
        const parsedData = Papa.parse(data, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
        });

        if (parsedData?.data) {
          setRowData(parsedData.data);

          const colDefs = parsedData.meta.fields.map((field) => ({
            headerName: field,
            field,
            sortable: true,
            filter: true,
            resizable: true,
          }));

          setColumnDefs(colDefs);
        }
      })
      .catch((error) => console.error('Error loading or parsing CSV:', error));
  }, []);

  const onRowClicked = (params) => {
    const clickedName = params.data?.Name; // must match CSV header exactly
    if (!clickedName) return;

    onSelectGame(clickedName === selectedGameName ? null : clickedName);
  };

  return (
    <div style={{ height: '100%', width: '100%', background: '#0b0b0f' }}>
      <AgGridReact
        theme={gridTheme}
        onGridReady={onGridReady}
        onFirstDataRendered={onFirstDataRendered}
        getRowId={({ data }) => data.Name}
        rowSelection={{ mode: 'singleRow' }}
        onRowClicked={onRowClicked}
        columnDefs={columnDefs}
        rowData={rowData}
        animateRows={true}
        defaultColDef={{ sortable: true, filter: true, resizable: true }}
      />
    </div>
  );
};

export default Table;
