import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';

function Graph() {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const svgRef = useRef();
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

    // Function to update the dimensions state
    const updateDimensions = () => {
        setDimensions({
            width: window.innerWidth,
            height: window.innerHeight
        });
    };

    useEffect(() => {
        // Add resize event listener
        window.addEventListener("resize", updateDimensions);

        // Remove event listener on cleanup
        return () => window.removeEventListener("resize", updateDimensions);
    }, []); // Empty dependency array means this effect runs only on mount and unmount

    useEffect(() => {
        d3.csv("./public/testCSV4.csv").then(data => {
            const filteredData = data.filter(d => d.has_canonical_name_object && d.has_canonical_name_subject);

            // Create links from the filtered data
            const links = filteredData.map(d => ({
                source: d.entity_id,
                target: d.object,
                predicate: d.predicate,
                has_name_subject: d.has_name_subject,
                has_name_object: d.has_entity_type_object,
                has_entity_type_subject: d.has_entity_type_subject,
                has_entity_type_object: d.has_entity_type_object,
                has_canonical_name_subject: d.has_canonical_name_subject,
                has_canonical_name_object: d.has_canonical_name_object,
                metadata: d.metadata,
                metadataValue: formatMetadata(d.metadata),
            }));

            const nodesMap = new Map();

            links.forEach(d => {
                if (!nodesMap.has(d.source)) {
                    nodesMap.set(d.source, {
                        id: d.source,
                        entity_id: d.entity_id,
                        predicate: d.predicate,
                        has_name_subject: d.has_name_subject,
                        has_name_object: d.has_entity_type_object,
                        has_entity_type_subject: d.has_entity_type_subject,
                        has_entity_type_object: d.has_entity_type_object,
                        has_canonical_name_subject: d.has_canonical_name_subject,
                        has_canonical_name_object: d.has_canonical_name_object,
                        metadata: formatMetadata(d.metadata),
                    });
                }

                if (!nodesMap.has(d.target)) {
                    nodesMap.set(d.target, {
                        id: d.target,
                        entity_id: d.entity_id,
                        predicate: d.predicate,
                        has_name_subject: d.has_name_object,
                        has_name_object: d.has_entity_type_object,
                        has_entity_type_subject: d.has_entity_type_object,
                        has_entity_type_object: d.has_entity_type_object,
                        has_canonical_name_subject: d.has_canonical_name_object,
                        has_canonical_name_object: d.has_canonical_name_object,
                        metadata: formatMetadata(d.metadata),
                    });
                }
            });

            const nodes = Array.from(nodesMap.values());

            setGraphData({ nodes, links });

        });

        //function to format the metadata confidence number to a readable percentage
        function formatMetadata(value) {
            let cleanValue = value.replace(/[^\d.-]/g, '');
            let numberValue = parseFloat(cleanValue);

            if (isNaN(numberValue)) {
                return 'value is N/A';
            }

            //convert to a percentage and format to 4 decimal places
            let percentage = numberValue * 100;
            let formattedPercentage = percentage.toFixed(2);

            if (percentage % 1 === 0 || percentage === 100) {
                formattedPercentage = percentage.toFixed(0);
            }

            return formattedPercentage + '%';
        }

    }, []);

    useEffect(() => {
        if (!graphData.nodes.length) return;

        const svgElement = d3.select(svgRef.current);
        svgElement.selectAll("*").remove();

        svgElement.attr('width', dimensions.width).attr('height', dimensions.height);

        const g = svgElement.append('g');

        const zoom = d3.zoom()
            .scaleExtent([0.1, 30])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        svgElement.call(zoom);

        const simulation = d3.forceSimulation(graphData.nodes)
            .force('link', d3.forceLink(graphData.links).id(d => d.id))
            .force('charge', d3.forceManyBody())
            .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2));

        const link = g.append('g')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.6)
            .selectAll('line')
            .data(graphData.links)
            .join('line')
            .attr('stroke-width', 2);

        const node = g.append('g')
            .attr('stroke', '#fff')
            .attr('stroke-width', 1.5)
            .selectAll('circle')
            .data(graphData.nodes)
            .join('circle')
            .attr('r', 5)
            .attr('fill', d => getNodeColor(d))
            .call(drag(simulation));

        node.append('title')
            .text(d => d.id);

        //node color based on entity type subject function
        function getNodeColor(node) {
            const entityTypeValue = node.has_entity_type_subject;
            return entityTypeValue === 'name1' ? '#F2505D' :
                entityTypeValue === 'name2' ? '#3243A6' :
                    entityTypeValue === 'name3' ? '#F28A2E' :
                        '#80D2F2';
        };

        simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
        });

        // Drag functionality
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
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended);
        }
    }, [graphData]); // Ensure useEffect is called when graphData changes

    return (
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height}>
            {/* D3 code to render the graph will go here */}
        </svg>
    );
}

export default Graph;