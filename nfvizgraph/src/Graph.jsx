import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearchPlus, faSearchMinus, faUndo } from '@fortawesome/free-solid-svg-icons';
import Tooltip from './Tooltip';

function Graph() {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const initialized = useRef(false);

    useEffect(() => {
        const svg = d3.select(svgRef.current)
            .style('background-color', "#121212");

        if (!initialized.current) {
            initialized.current = true;
            initializeGraph(svg);
        }

        const zoomBehavior = d3.zoom()
            .scaleExtent([0.5, 2]) // Limit scale to 50% min and 200% max
            .on("zoom", (event) => {
                svg.selectAll('g').attr("transform", event.transform);
            });

        svg.call(zoomBehavior);

        const resizeObserver = new ResizeObserver(entries => {
            if (entries.length === 0 || entries[0].target !== containerRef.current) return;
            const { width, height } = entries[0].contentRect;
            svg.attr("width", width)
                .attr("height", height);
        });

        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    function initializeGraph(svg) {
        const width = svg.style("width");
        const height = svg.style("height");

        svg.attr("width", width)
            .attr("height", height);
            const graphContainer = svg.append('g');

        d3.csv('./games.csv').then(data => {
            const nodes = data.map(d => ({ 
                id: d.Name, 
                group: d.Developer,
                console: d.Console,
                year: d.Year,
                publisher: d.Publisher 
            }));
            const links = [];
            const developerMap = {};

            nodes.forEach(node => {
                if (!developerMap[node.group]) {
                    developerMap[node.group] = [];
                }
                developerMap[node.group].push(node.id);
            });

            for (let dev in developerMap) {
                const games = developerMap[dev];
                games.forEach((source, i) => {
                    games.forEach((target, j) => {
                        if (i !== j) {
                            links.push({ source, target });
                        }
                    });
                });
            }

            const simulation = d3.forceSimulation(nodes)
                .force("link", d3.forceLink(links).id(d => d.id))
                .force("charge", d3.forceManyBody())
                .force("center", d3.forceCenter(svg.attr("width") / 2, svg.attr("height") / 2));

            const link = graphContainer.append("g")
                .selectAll("line")
                .data(links)
                .enter().append("line")
                .attr("stroke", "#999")
                .attr("stroke-opacity", 0.6);

            const node = graphContainer.append("g")
                .selectAll("circle")
                .data(nodes)
                .enter().append("circle")
                .attr("r", 5)
                .attr("fill", d => colorByConsole(d.console))
                .attr('stroke', '#999')
                .attr('stroke-width', '1.5')
                .call(drag(simulation));

            simulation.on("tick", () => {
                link.attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);

                node.attr("cx", d => d.x)
                    .attr("cy", d => d.y);
            });
        });
    }

    function colorByConsole(consoleName) {
        const colorMap = {
            'Switch': '#FF6347',   // red
            'N64': '#50C878',    // green
            'GameCube': '#DDA0DD',  // purple
            'Wii': '#5BE3FF',    // light blue
            'WiiU': '#005CA6',   // blue
            'SNES': '#cccccc'  // gray
        };
        return colorMap[consoleName] || '#888';
    }

    function drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100vh' }}>
            <svg ref={svgRef}></svg>
        </div>
    );
}

export default Graph;