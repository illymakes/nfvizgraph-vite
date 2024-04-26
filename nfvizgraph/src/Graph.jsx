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
    const zoomRef = useRef(d3.zoom().scaleExtent([0.1, 8]));

    useEffect(() => {
        const svg = d3.select(svgRef.current)
            .attr('width', '100vw')
            .attr('height', '100%')
            .style('background-color', "#121212");

        if (!initialized.current) {
            initialized.current = true;
            initializeGraph(svg);
            setTimeout(() => setInitialZoom(svg), 100);
        }

        const zoomBehavior = d3.zoom()
            .scaleExtent([0.5, 2]) // Limit scale to 50% min and 200% max
            .on("zoom", (event) => {
                svg.selectAll('g').attr("transform", event.transform);
            });

        svg.call(zoomBehavior);

        const resizeObserver = new ResizeObserver(entries => {
            if (entries.length === 0 || entries[0].target !== containerRef.current) return;
            svg.attr("width", '100vw')
                .attr("height", '100%');
            setInitialZoom(svg); // Reapply the initial zoom when resized
        });

        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    function setInitialZoom(svg) {
        const svgRect = svg.node().getBoundingClientRect();
        const width = svgRect.width;
        const height = svgRect.height;

        const initialTransform = d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(0.9)
            .translate(-width / 2, -height / 2);

        svg.transition().duration(750).call(zoomRef.current.transform, initialTransform);
    }

    function initializeGraph(svg) {
        const width = parseInt(svg.style("width"));
        const height = parseInt(svg.style("height"));

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

            const initialLinkDistance = 150;
            const initialChargeStrength = -50;

            const simulation = d3.forceSimulation(nodes)
                .force('link', d3.forceLink(links).id(d => d.id).distance(initialLinkDistance))
                .force('charge', d3.forceManyBody().strength(initialChargeStrength).distanceMax(275))
                .force('center', d3.forceCenter(width / 2, height / 2))
                .force('collide', d3.forceCollide(5))
                .force('x', d3.forceX().strength(0.1))
                .force('y', d3.forceY().strength(0.1))
                .force('label', d3.forceManyBody().strength(-1000));

            const link = graphContainer.append("g")
                .selectAll("line")
                .data(links)
                .enter().append("line")
                .attr("stroke", "#ff00f3")
                .attr("stroke-opacity", 0.2)
                .attr('stroke-width', '1.5');

            const node = graphContainer.append("g")
                .selectAll("circle")
                .data(nodes)
                .enter().append("circle")
                .attr("r", 5)
                .attr("fill", d => colorByConsole(d.console))
                .attr('stroke', '#ff00f3')
                .attr('stroke-width', '1.5')
                .call(drag(simulation));

            const labels = graphContainer.append("g")
                .selectAll("text")
                .data(nodes, d => d.id)
                .enter().append("text")
                .text(d => d.id)
                .attr("x", d => d.x)
                .attr("y", d => d.y)
                .style('fill', '#fff')
                .style('font-size', '16px')
                .style("font-family", "Roboto Mono, Arial, sans-serif")
                .attr("text-anchor", "right")
                .attr("dy", "-0.5em");

            node.call(drag(simulation));

            simulation.on("tick", () => {
                link.attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);

                node.attr("cx", d => d.x)
                    .attr("cy", d => d.y);

                labels.attr('x', d => d.x + 8)
                    .attr('y', d => d.y) + 3;
            });
        });
    }

    function colorByConsole(consoleName) {
        const colorMap = {
            'Switch': '#FF7AF3',   // pink
            'N64': '#50C878',    // green
            'GameCube': '#36368a',  // purple
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