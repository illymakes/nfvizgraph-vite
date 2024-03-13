import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';

function Graph() {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const svgRef = useRef();
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
    const [isLoading, setIsLoading] = useState(true);

    // Function to start a timer
    const startTimer = (simulation) => {
        let elapsed = 0;
        const t = d3.timer((elapsed) => {
            if (elapsed > 4000) {
                simulation.alphaDecay(0.4);
                t.stop();
            }
        }, 3000);
    };


    //useEffect for CSV handling
    useEffect(() => {
        const loadData = async () => {
            const data = await d3.csv("./testCSV4.csv");
            const filteredData = data.filter(d => d.has_canonical_name_object && d.has_canonical_name_subject);
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
                        label_text: d.has_canonical_name_subject,
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
                        label_text: d.has_canonical_name_object,
                        metadata: formatMetadata(d.metadata),
                    });
                };
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

            const nodes = Array.from(nodesMap.values());

            setGraphData({ nodes, links });
            setIsLoading(false);
        };

        loadData();
    }, []);

    // useEffect for window resize
    useEffect(() => {
        function handleResize() {
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        }

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    //useEffect for graph loading
    useEffect(() => {
        if (isLoading) return;

        const { width, height } = dimensions;

        const svgElement = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height);

        svgElement.selectAll("*").remove();

        const g = svgElement.append('g');

        const zoom = d3.zoom()
            .scaleExtent([0.1, 30])
            .on('zoom', (event) => {
                zoomed(event)
                simulation.restart()
                startTimer(simulation);
            });

        //define a variable to store the zoom transformation
        let currentTransform = d3.zoomIdentity;

        const initialLinkDistance = 50;
        const initialChargeStrength = -600;
        const linkCollideRadius = 5;
        const unrelatedLinkDistance = 50;
        const relatedLinkDistance = 0;

        const simulation = d3.forceSimulation(graphData.nodes)
            .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(initialLinkDistance))
            .force('charge', d3.forceManyBody().strength(initialChargeStrength))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collide', d3.forceCollide(15))
            .force('x', d3.forceX().strength(0.1))
            .force('y', d3.forceY().strength(0.1))
            .force('label', d3.forceManyBody().strength(-1000));

        startTimer(simulation);

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

        const label = g.append('g')
            .selectAll("text")
            .data(graphData.nodes)
            .enter().append("text")
            .text(d => d.label_text)
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .style("fill", "#fff")
            .style("font-family", "RobotoMono Regular, Arial, sans-serif") //fix this source
            .attr("text-anchor", "right") // Centers text on the node's x coordinate
            .attr("dy", "1em"); //spacing of text on the y i think around node

        //node color based on entity type subject function
        function getNodeColor(node) {
            const entityTypeValue = node.has_entity_type_subject;
            return entityTypeValue === 'name1' ? '#F2505D' :
                entityTypeValue === 'name2' ? '#3243A6' :
                    entityTypeValue === 'name3' ? '#F28A2E' :
                        '#80D2F2';
        };

        function zoomed(event) {
            currentTransform = event.transform;
            g.attr('transform', event.transform);

            //adjust link distance and charge strength based on zoom level
            const zoomScale = currentTransform.k;
            const adjustedLinkDistance = initialLinkDistance / zoomScale;
            const adjustedChargeStrength = initialChargeStrength / zoomScale;
            const adjustedCollideRadius = 12 / zoomScale;

            simulation.force('link').distance(adjustedLinkDistance);
            simulation.force('charge').strength(adjustedChargeStrength);
            simulation.force('collide').strength(adjustedCollideRadius);
            simulation.force('linkCollide', d3.forceCollide(linkCollideRadius));
            simulation.force('link').distance(d => {
                return d.source === d.target ? relatedLinkDistance : unrelatedLinkDistance
            });

            const minFontSize = 10;
            const maxFontSize = 16;
            const adjustedFontSize = Math.max(minFontSize, Math.min(maxFontSize, 16 / Math.sqrt(zoomScale)));

            //adjust font size according to zoom lvl
            label.style('font-size', `${adjustedFontSize}px`);
            startTimer(simulation);
        };

        svgElement.call(zoom);

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
        };

        startTimer(simulation);

        simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);

            label
                .attr('x', d => d.x)
                .attr('y', d => d.y);
        });

    }, [isLoading, graphData, dimensions]); // Ensure useEffect is called when graphData changes

    return (
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height}>
            {/* D3 code to render the graph will go here */}
        </svg>
    );
};

export default Graph;