import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import 'bootstrap/dist/css/bootstrap.min.css';
import Tooltip from './Tooltip';
import Sidebar from './Sidebar';

function Graph({}) {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const sidebarRef = useRef(null);
    const initialized = useRef(false);
    const [tooltipData, setTooltipData] = useState({ visible: false, content: '', x: 0, y: 0 });
    const [sidebarData, setSidebarData] = useState({ visible: false, content: '' });
    const [selectedNode, setSelectedNode] = useState(null);

    useEffect(() => {
        const svg = d3.select(svgRef.current)
            .attr('width', '100%')
            .attr('height', '100%')
            .style('background-color', "#121212");

        if (!initialized.current) {
            initialized.current = true;
            initializeGraph(svg);
        }

        const zoomBehavior = d3.zoom()
            .scaleExtent([0.1, 8])
            .on("zoom", (event) => {
                svg.select('g').attr("transform", event.transform);

            });

        svg.call(zoomBehavior);

        const resizeObserver = new ResizeObserver(entries => {
            if (entries.length === 0 || entries[0].target !== containerRef.current) return;
            svg.attr("width", '100%')
                .attr("height", '100%');
        });

        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {

            if (sidebarData.visible &&
                sidebarRef.current && !sidebarRef.current.contains(event.target) &&
                svgRef.current && !svgRef.current.contains(event.target)) {
                setSidebarData({ visible: false, content: '' });
            }
        };

        const timer = setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 100);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [sidebarData.visible]);

    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        const node = svg.selectAll("circle");

        node.each(function (d) {
            d3.select(this)
                .attr('stroke', d === selectedNode ? 'yellow' : 'rgba(255, 0, 243, 1)')
                .attr('stroke-width', d === selectedNode ? '3' : '1.5');
        });

    }, [selectedNode]);

    function initializeGraph(svg) {
        const width = parseInt(svg.style("width"));
        const height = parseInt(svg.style("height"));

        svg.attr("width", width)
            .attr("height", height);

        const graphContainer = svg.append('g');

        svg.on("click", (event) => {
            if (event.target === svg.node()) {
                setSidebarData({ visible: false, content: '' });
            }
        });

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
                .force('label', d3.forceManyBody().strength(-1000))
                .on('tick', () => {
                    link.attr("x1", d => d.source.x)
                        .attr("y1", d => d.source.y)
                        .attr("x2", d => d.target.x)
                        .attr("y2", d => d.target.y);

                    node.attr("cx", d => d.x)
                        .attr("cy", d => d.y);

                    labels.attr('x', d => d.x + 8)
                        .attr('y', d => d.y) + 3;
                });

            const link = graphContainer.append("g")
                .selectAll("line")
                .data(links)
                .enter().append("line")
                .attr("stroke", "rgba(255, 0, 243, 1)")
                .attr("stroke-opacity", 0.9)
                .attr('stroke-width', '1.5')
                .on('mouseover', (event, d) => {
                    const [x, y] = d3.pointer(event, svg.node());
                    const sourceData = nodes.find(node => node.id === d.source.id);
                    const targetData = nodes.find(node => node.id === d.target.id);
                    const contentHTML = `
                    <table class="tooltip-table">
                        <tr>
                            <th scope="col">Developer: <br>
                            ${sourceData.group}</th>
                            <th scope="col">Source</th>
                            <th scope="col">Target</th>
                        </tr>
                        <tr>
                            <td><b>Game:</b></td>
                            <td>${sourceData.id}</td>
                            <td>${targetData.id}</td>
                        </tr>
                        <tr>
                            <td><b>Year:</b></td>
                            <td>${sourceData.year}</td>
                            <td>${targetData.year}</td>
                        </tr>
                        <tr>
                            <td><b>Console:</b></td>
                            <td>${sourceData.console}</td>
                            <td>${targetData.console}</td>
                        </tr>
                        <tr>
                            <td><b>Publisher:</b></td>
                            <td>${sourceData.publisher}</td>
                            <td>${targetData.publisher}</td>
                        </tr>
                    </table>
                    `;
                    setTooltipData({
                        visible: true,
                        content: `<div class='tooltip-link-content'>${contentHTML}</div>`,
                        x: x + 20,
                        y: y - 50
                    });
                })
                .on('mouseout', () => {
                    setTooltipData({ visible: false, content: '', x: 0, y: 0 });
                });

            const node = graphContainer.append("g")
                .selectAll("circle")
                .data(nodes)
                .enter().append("circle")
                .attr("r", 5)
                .attr("fill", d => colorByConsole(d.console))
                .attr('stroke', d => d === selectedNode ? 'yellow' : 'rgba(255, 0, 243, 1)')
                .attr('stroke-width', d => d === selectedNode ? '3' : '1.5')
                .on('click', (event, d) => {
                    event.stopPropagation();
                    setSelectedNode(d === selectedNode ? null : d);
                    updateNodeStyles();
                })
                .on('mouseover', (event, d) => {
                    const [x, y] = d3.pointer(event, svg.node());
                    const contentHTML =
                        `<b>${d.id}</b><br>
                    <b>Console:</b> ${d.console}<br>
                    <b>Year:</b> ${d.year}<br>
                    <b>Developer:</b> ${d.group}<br>
                    <b>Publisher:</b> ${d.publisher}`;
                    setTooltipData({
                        visible: true,
                        content: contentHTML,
                        x: x + 20,
                        y: y - 50
                    });
                })
                .on('mouseout', () => {
                    setTooltipData({ visible: false, content: '', x: 0, y: 0 });
                })
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


            function handleNodeClick(event, d) {
                const contentHTML = `
                <h3>${d.id}</h3>
                    <p><strong>Console:</strong> ${d.console}</p>
                    <p><strong>Year:</strong> ${d.year}</p>
                    <p><strong>Developer:</strong> ${d.group}</p>
                    <p><strong>Publisher:</strong> ${d.publisher}</p>
                `;
                setSidebarData({
                    visible: true,
                    content: contentHTML
                });


            }

            node.on('click', (event, d) => handleNodeClick(event, d));

            function handleLinkClick(event, d) {
                const sourceData = nodes.find(node => node.id === d.source.id);
                const targetData = nodes.find(node => node.id === d.target.id);
                const contentHTML = `
                    <table class="sidebar-table">
                        <tr>
                            <th scope="col">Developer: <br>
                            ${sourceData.group}</th>
                            <th scope="col">Source</th>
                            <th scope="col">Target</th>
                        </tr>
                        <tr>
                            <td><b>Game:</b></td>
                            <td>${sourceData.id}</td>
                            <td>${targetData.id}</td>
                        </tr>
                        <tr>
                            <td><b>Year:</b></td>
                            <td>${sourceData.year}</td>
                            <td>${targetData.year}</td>
                        </tr>
                        <tr>
                            <td><b>Console:</b></td>
                            <td>${sourceData.console}</td>
                            <td>${targetData.console}</td>
                        </tr>
                        <tr>
                            <td><b>Publisher:</b></td>
                            <td>${sourceData.publisher}</td>
                            <td>${targetData.publisher}</td>
                        </tr>
                    </table>
                    `;
                setSidebarData({
                    visible: true,
                    content: contentHTML
                });
            }
            link.on('click', (event, d) => handleLinkClick(event, d));

        });
    }

    useEffect(() => {
        updateNodeStyles();
    }, [selectedNode]);

    function updateNodeStyles() {
        const svg = d3.select(svgRef.current);
        svg.selectAll("circle")
            .each(function (d) {
                d3.select(this)
                    .attr('stroke', d === selectedNode ? 'yellow' : 'rgba(255, 0, 243, 1)')
                    .attr('stroke-width', d === selectedNode ? '3' : '1.5');
            });
            console.log('updateNodeStyles called')
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
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0)
            //event.subject.fx = null; --enabling these will reset the node positions so they are no longer sticky
            //event.subject.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100vh' }}>
            <svg ref={svgRef}></svg>
            <Tooltip
                visible={tooltipData.visible}
                content={tooltipData.content}
                x={tooltipData.x}
                y={tooltipData.y}
            />
            <Sidebar
                ref={sidebarRef}
                isVisible={sidebarData.visible}
                content={sidebarData.content}
                onClose={() => setSidebarData({ visible: false, content: '' })}
            />
        </div>
    );
}

export default Graph;