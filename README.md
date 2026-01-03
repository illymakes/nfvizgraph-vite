# nfvizgraph-vite

**nfvizgraph-vite** is a React + Vite data visualization application built primarily with **D3.js**, designed to explore interactive graph-based visualizations and complex data relationships in a modern frontend environment.

🔗 **Live Demo:**  
https://illymakes.github.io/nfvizgraph-vite/

---

## Overview

This project was originally developed as an internal web application for a previous role and later repurposed as a **portfolio piece** to showcase frontend data visualization skills. In its current portfolio state, the application visualizes relationships between **video game titles and their developers** using an interactive graph.

The app demonstrates how complex datasets can be explored visually through direct manipulation, coordinated views, and responsive UI patterns.

---

## Features

- **Interactive graph visualization**
  - Plot points represent video game titles
  - Titles are visually grouped by shared **Developer**
  - Built primarily with **D3.js** for rendering and interaction

- **Hover & click interactions**
  - Hovering over points reveals contextual information
  - Clicking a point opens a **sidebar panel** with detailed game metadata

- **Relationship links**
  - Connections between related points are visualized
  - Hovering or clicking a link displays a comparison table showing the two connected items and their details

- **Coordinated table view**
  - Full dataset is viewable in a sortable, filterable table
  - Selecting a row in the table automatically highlights the corresponding point in the graph
  - Enables seamless switching between visual and tabular analysis

- **CSV upload support**
  - Users can upload CSV files (following the expected schema)
  - Uploaded data is immediately visualized in the graph
  - Allows the app to be reused with different datasets without code changes

- **Responsive UI layout**
  - Graph view
  - Sidebar detail panels
  - Modal overlays
  - Data table view

---

## Tech Stack

- **D3.js** – core graph rendering and interaction logic
- **React** – UI composition and state coordination
- **Vite** – fast dev server and optimized production builds
- **Bootstrap** – layout and responsive utilities
- **Font Awesome** – iconography
- **AG Grid React** – high-performance data table
- **Papa Parse** – CSV parsing and ingestion
- **Modals & overlays** – contextual UI layers

---

## Architecture Notes

- The visualization layer is D3-driven, with React managing:
  - UI state
  - View coordination
  - Component lifecycle
- The table and graph are **linked views**, ensuring selections in one are reflected in the other.
- CSV ingestion allows the application to operate independently of a fixed backend.
- The structure supports extension to:
  - API-driven datasets
  - Larger-scale graph data
  - User-defined schemas and filters

---

## Purpose

This project exists to demonstrate:

- Practical use of **D3.js** within a React application
- Interactive data visualization patterns
- Coordinated multiple views (graph ↔ table ↔ sidebar)
- Handling real-world datasets with flexible ingestion
- Bridging exploratory data analysis and frontend UI design

While presented here with video game data, the same architecture can be applied to domains such as analytics dashboards, network graphs, content catalogs, or relationship mapping tools.

---

## Author

Built by **illymakes**  
🔗 https://illymakes.com  
🔗 https://github.com/illymakes

---

## License

This project is provided for portfolio and demonstration purposes.
