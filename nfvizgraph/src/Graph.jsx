import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearchPlus, faSearchMinus, faUndo } from '@fortawesome/free-solid-svg-icons';

function Graph() {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const svgRef = useRef();
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
    const [isLoading, setIsLoading] = useState(true);
    const [timer, setTimer] = useState(null);

    // zoomRef setup
    const zoomRef = useRef(d3.zoom().scaleExtent([0.1, 8]));

    //zoom setup and behavior
    const setupZoom = () => {
        const svg = d3.select(svgRef.current);
        const g = svg.select('g');

        //zoom behavior
        const zoomBehavior = d3.zoom()
            .scaleExtent([0.1, 8])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        svg.call(zoomBehavior);
        zoomRef.current = zoomBehavior;
    };

    //initial zoom func
    const setInitialZoom = () => {
        const svg = d3.select(svgRef.current);
        svg.transition().duration(750).call(zoomRef.current.transform, d3.zoomIdentity);
    };

    //zoom to fit func
    const zoomToFit = () => {
        const svg = d3.select(svgRef.current);
        const g = svg.select('g');
        const bounds = g.node().getBBox();
        const parent = svg.node().getBoundingClientRect();
        const width = bounds.width,
            height = bounds.height;
        const fullWidth = parent.width,
            fullHeight = parent.height;
        const midX = bounds.x + width / 2,
            midY = bounds.y + height / 2;
        if (width === 0 || height === 0) return; // Nothing to fit
        const scale = 0.95 / Math.max(width / fullWidth, height / fullHeight);
        const translate = [(fullWidth / 2 - scale * midX), (fullHeight / 2 - scale * midY)];

        // Apply the transform to the g element
        g.transition().duration(750).attr("transform", `translate(${translate})scale(${scale})`);

        // Update the zoom behavior's internal state to match the transformation
        zoomRef.current.transform(svg, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
    };

    //reset view func
    const resetView = () => {
        setInitialZoom();
    };

    // Function to start a timer
    const startTimer = (simulation) => {
        // Stop any existing timer to avoid multiple timers running
        if (timer) timer.stop();

        const newTimer = d3.timer(elapsed => {
            if (elapsed > 3000) {
                simulation.alphaDecay(0.4);
                newTimer.stop();
            }
        }, 3000);

        setTimer(newTimer); // Update the timer state
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
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    //useEffect for graph loading
    useEffect(() => {
        if (isLoading) return;

        const { width, height } = dimensions;

        const svgElement = d3.select(svgRef.current)
            .attr('width', '100vw')
            .attr('height', '100vh')
            .attr('viewBox', `0 0 ${width} ${height}`)
            .style('display', 'block')
            .style('max-width', '100%')
            .style('max-height', '100vh')
            .style('margin', 'auto');

        svgElement.call(zoomRef.current);

        svgElement.selectAll("*").remove();

        const g = svgElement.append('g')
            .attr('width', width)
            .attr('height', height)
            .style('fill', '#f2f2f2');

        //define a variable to store the zoom transformation
        let currentTransform = d3.zoomIdentity;
        const initialLinkDistance = 8;
        const initialChargeStrength = -400;
        const linkCollideRadius = 5;
        const unrelatedLinkDistance = 5;
        const relatedLinkDistance = 0;

        const simulation = d3.forceSimulation(graphData.nodes)
            .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(initialLinkDistance))
            .force('charge', d3.forceManyBody().strength(initialChargeStrength))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collide', d3.forceCollide(15))
            .force('x', d3.forceX().strength(0.1))
            .force('y', d3.forceY().strength(0.1))
            .force('label', d3.forceManyBody().strength(-1000));

        simulation.force('link').distance(d => {
            return d.source === d.target ? relatedLinkDistance : unrelatedLinkDistance
        });

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
            .data(graphData.nodes, d => d.id)
            .enter().append("text")
            .text(d => d.label_text)
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .style('fill', '#fff')
            .style('font-size', '22px')
            .style("font-family", "RobotoMono Regular, Arial, sans-serif") //fix this source
            .attr("text-anchor", "right")
            .attr("dy", "-0.5em");

        //node color based on entity type subject function
        function getNodeColor(node) {
            const entityTypeValue = node.has_entity_type_subject;
            return entityTypeValue === 'name1' ? '#F2505D' :
                entityTypeValue === 'name2' ? '#3243A6' :
                    entityTypeValue === 'name3' ? '#F28A2E' :
                        '#80D2F2';
        };

        const zoom = d3.zoom()
            .scaleExtent([0.4, 4])
            .on('zoom', (event) => {
                zoomed(event);
                simulation.restart();
                startTimer(simulation);
            });

        //initial zoom level but it has problems
        // svgElement.call(zoom);
        // const initialTransform = d3.zoomIdentity.scale(0.8);
        // svgElement.call(zoom.transform, initialTransform);

        function zoomed(event) {
            currentTransform = event.transform;
            g.attr('transform', event.transform);

            //adjust link distance and charge strength based on zoom level
            const zoomScale = currentTransform.k;
            const adjustedLinkDistance = initialLinkDistance / zoomScale;
            const adjustedChargeStrength = initialChargeStrength / zoomScale;
            const adjustedCollideRadius = 14 / zoomScale;

            simulation.force('link').distance(adjustedLinkDistance);
            simulation.force('charge').strength(adjustedChargeStrength);
            simulation.force('collide').strength(adjustedCollideRadius);
            simulation.force('linkCollide', d3.forceCollide(linkCollideRadius));

            const minFontSize = 22;
            const maxFontSize = 32;

            const adjustedFontSize = Math.max(minFontSize, Math.min(maxFontSize, 32 / Math.sqrt(zoomScale)));

            //adjust font size according to zoom lvl
            label.style('font-size', `${adjustedFontSize}px`);
            startTimer(simulation);
        };

        // Drag functionality
        function drag(simulation) {
            function dragstarted(event) {
                d3.select(this).attr('cursor', 'grabbing')
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
                if (timer) timer.stop();
            }

            function dragged(event) {
                d3.select(this).attr('cursor', 'grabbing')
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }

            function dragended(event) {
                d3.select(this).attr('cursor', 'grabbing')
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
                startTimer(simulation);
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

        //label force sim for spacing
        const labelForceSimulation = d3.forceSimulation(graphData.nodes)
            .force("charge", d3.forceManyBody().strength(-80))
            .force("collide", d3.forceCollide().radius(d => {
                return 40;
            }))
            .on("tick", () => {
                label
                    .attr('x', d => d.x)
                    .attr('y', d => d.y)
            });

        setupZoom();

        setTimeout(() => {
            labelForceSimulation.stop();
        }, 4000);

    }, [isLoading, graphData, dimensions]);

    return (
        <>
            <div className="view-buttons-container">
                <button className="zoom-button-in">
                    <FontAwesomeIcon icon={faSearchPlus} />
                </button>
                <button className="zoom-button-out">
                    <FontAwesomeIcon icon={faSearchMinus} />
                </button>
                <button className="zoom-button-fit" onClick={zoomToFit}>
                    <img src="/img/zoom-to-fit.svg" alt="Zoom-To-Fit" />
                </button>
                <button className="zoom-button-reset" onClick={resetView}>
                    <FontAwesomeIcon icon={faUndo} />
                </button>
            </div>
            <svg ref={svgRef}>
                {/* D3 code to render the graph will go here */}
            </svg>
        </>
    );
};

export default Graph;