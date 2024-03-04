import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const GraphComponent = ({ graphData }) => {
    const graphContainerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    // Initialize the graph (similar to componentDidMount and componentDidUpdate)
    useEffect(() => {
        if (!graphData || graphData.length === 0) return;

        // Main function to create the graph
        const createGraph = () => {
            // Clear any existing SVG
            d3.select(graphContainerRef.current).select('svg').remove();

            const links = graphData.map(d => {
                if (d.has_canonical_name_object && d.has_canonical_name_subject) {
                    let rawAmount = d.amount;
                    let formattedAmount = formatAmount(d.amount); // Format the amount value

                    return {
                        source: d.entity_id,
                        target: d.object,
                        entity_id: d.entity_id,
                        predicate: d.predicate,
                        has_name_subject: d.has_name_subject,
                        has_name_object: d.has_name_object,
                        has_entity_type_subject: d.has_entity_type_subject,
                        has_entity_type_object: d.has_entity_type_object,
                        has_canonical_name_subject: d.has_canonical_name_subject,
                        docid: d.docid,
                        pubdate: d.pubdate,
                        url: d.url,
                        amount: rawAmount,
                        formattedAmount: formattedAmount,
                    }
                } else {
                    return false
                }
            });

            links = links.filter(d => (d != false))

            const nodesMap = new Map();
            links.forEach(d => {
                let formattedAmount = formatAmount(d.amount); // Format the amount value
                nodesMap.set(d.source, {
                    id: d.source,
                    entity_id: d.entity_id,
                    predicate: d.predicate,
                    has_canonical_name_subject: d.has_canonical_name_subject,
                    has_canonical_name_object: d.has_canonical_name_object,
                    has_entity_type_subject: d.has_entity_type_subject,
                    has_entity_type_object: d.has_entity_type_object,
                    has_name_subject: d.has_name_subject,
                    has_name_object: d.has_name_object,
                    label_text: d.has_canonical_name_subject,
                    docid: d.docid,
                    pubdate: d.pubdate,
                    url: d.url,
                    amount: d.amount,
                })
                nodesMap.set(d.target, {
                    id: d.target,
                    entity_id: d.entity_id,
                    predicate: d.predicate,
                    has_canonical_name_subject: d.has_canonical_name_object,
                    has_canonical_name_object: d.has_canonical_name_object,
                    has_entity_type_subject: d.has_entity_type_object,
                    has_entity_type_object: d.has_entity_type_object,
                    has_name_subject: d.has_name_object,
                    has_name_object: d.has_name_object,
                    label_text: d.has_canonical_name_object,
                    docid: d.docid,
                    pubdate: d.pubdate,
                    url: d.url,
                    amount: d.amount,
                })
            });

            const nodes = Array.from(nodesMap.values());

            // Example: Create an SVG element
            const svg = d3.select(graphContainerRef.current)
                .append('svg')
                .style('top', 0)
                .style('left', 0)
                .attr('width', clientWidth)
                .attr('height', clientHeight);

            // Calculate initial center coordinates
            const initialCenterX = width / 2 + 600;
            const initialCenterY = height / 2 + 400;

            //Add background rectangle for panning
            const g = svg.append('g')
                .attr('width', width)
                .attr('height', height)
                .style('fill', '#F2F2F2')
                .attr('transform', `translate(${initialCenterX},${initialCenterY})`); // Set initial translation

            //declare zoom
            const zoom = d3.zoom()
                .scaleExtent([0.1, 10]) // min and max zoom levels
                .on('zoom', (event) => {
                    zoomed(event)
                    simulation.restart()
                });

            //give the SVG zoom behavior
            svg.call(zoom);

            // Process your graphData here to create nodes and links arrays as needed

            //Variables to store initial force sim parameters
            const initialLinkDistance = 50;
            const initialChargeStrength = -600;

            // Create the simulation for the graph layout
            const simulation = d3.forceSimulation(nodes)
                .force('link', d3.forceLink(links).id(d => d.id).distance(initialLinkDistance))
                .force('charge', d3.forceManyBody().strength(initialChargeStrength))
                .force('center', d3.forceCenter(width / 2, height / 2))
                .force('collide', d3.forceCollide(15)) // Adjust the collide radius as needed
                .force('x', d3.forceX().strength(0.1))
                .force('y', d3.forceY().strength(0.1))
                .force('label', d3.forceManyBody().strength(-1000)); // Negative strength to repel labels

            //Add links to the graph (append to g)
            const link = g.selectAll('.link')
                .data(links)
                .enter().append('line')
                .attr('class', 'link')
                .style('stroke-width', 3) // Adjust link width
                .style('stroke', '#f2f2f2')
                .style('pointer-events', 'stroke');


            // Function to determine node radius based on zoom scale
            function getNodeRadius() {
                const baseRadius = 12;
                const maxRadius = 40; // Adjust as needed
                const minRadius = 12; // Adjust as needed

                const zoomScale = d3.event ? d3.event.transform.k : 6;
                const scaledRadius = baseRadius * zoomScale;

                return Math.max(minRadius, Math.min(scaledRadius, maxRadius));
            }

            //add drag behavior to nodes
            const drag = d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended);

            //Add nodes to the graph with color based on node type
            const node = g.selectAll('.node')
                .data(nodes)
                .enter().append('circle')
                .attr('class', 'node')
                .attr('r', getNodeRadius) // Set initial radius
                .style('fill', d => getNodeColor(d)) //Set node color based on column 10
                .style('filter', 'drop-shadow(0 0 5px rgba(0, 0, 0, 0.5))')
                .call(drag);

            //Add labels to nodes (append to g)
            const label = g.selectAll('.label')
                .data(nodes)
                .enter().append('text')
                .attr('class', 'label')
                .text(d => d.has_canonical_name_subject) //Set label text based on "has_canonical_name_subject"
                .attr('dy', -18)
                .style('fill', '#ffffff')//label color
                .style('font-size', '16px') // Increase font size
                .style('font-family', 'RobotoMono Regular, Arial, sans-serif') // Modern font
                .style('text-shadow', '1px 1px 1px rgba(255,255,255,0.8)') // Add a small stroke
                .each(function (d) {
                    //Store the intial font size in a data property
                    d.initialFontSize = parseFloat(d3.select(this).style('font-size'));
                });

            // Prevent overlapping links
            const unrelatedLinkDistance = 100; //Adjust as needed
            const relatedLinkDistance = 0; //Adjust as needed
            simulation.force('link').distance(d => {
                return d.source === d.target ? relatedLinkDistance : unrelatedLinkDistance
            });

            const linkCollideRadius = 5; //Adjust as needed
            simulation.force('linkCollide', d3.forceCollide(linkCollideRadius));

            //define a variable to store the zoom transformation
            let currentTransform = d3.zoomIdentity;

            // set initial zoom level
            const initialTransform = d3.zoomIdentity.scale(0.3); // Adjust the initial scale as needed
            svg.call(zoom.transform, initialTransform);

            //zoom function
            function zoomed(event) {
                currentTransform = event.transform;

                // Adjust link distance and charge strength based on zoom level
                const zoomScale = currentTransform.k;
                const adjustedLinkDistance = initialLinkDistance / zoomScale;
                const adjustedChargeStrength = initialChargeStrength / zoomScale;

                // Add buttons and set event listeners
                const zoomToFitButton = document.getElementById('zoomToFitButton');
                const zoomInButton = document.getElementById('zoom-button-in');
                const zoomOutButton = document.getElementById('zoom-button-out');
                const resetViewButton = document.getElementById('resetView');

                zoomToFitButton.addEventListener('click', () => {
                    //call a function to zoom to fit
                    zoomToFit();
                });

                zoomInButton.addEventListener('click', () => {
                    //call a function to zoom in
                    zoomInButtonFunc();
                });

                zoomOutButton.addEventListener('click', () => {
                    //call a function to zoom out
                    zoomOutButtonFunc();
                });

                resetViewButton.addEventListener('click', () => {
                    // Call a function to reset the view to the original state
                    resetView();
                });

                // Function to update the layout for View 1
                function updateLayoutForView1() {
                    // Customize the force simulation, link distance, charge strength, etc., for View 1
                    simulation.force('link').distance(initialLinkDistance);
                    simulation.force('charge').strength(initialChargeStrength);
                    simulation.force('collide').radius(15); // Adjust collide radius for View 1

                    // Restart simulation
                    simulation.alpha(1).restart();
                }

                // Function to update the layout for View 2
                function updateLayoutForView2() {
                    // Customize the force simulation, link distance, charge strength, etc., for View 2
                    simulation.force('link').distance(2 * initialLinkDistance);
                    simulation.force('charge').strength(-2 * initialChargeStrength);
                    simulation.force('collide').radius(10); // Adjust collide radius for View 2

                    // Restart simulation
                    simulation.alpha(1).restart();
                }

                // Function to zoom to fit
                function zoomToFit() {
                    const bounds = g.node().getBBox(); //get the bounding box of the graph elements
                    const parent = g.node().parentElement(); //get the parent element of the graph

                    const fullWidth = parent.clientWidth, fullHeight = parent.clientHeight; //width of the graph area
                    const width = bounds.width, height = bounds.height; //width and height of the bounding box
                    const midX = bounds.x + width / 2, midY = bounds.y + height / 2; //width of the bounding box

                    if (width === 0 || height === 0) return; //prevent scaling when bounding box has zero size

                    //calculate the scale needed to fit the graph within the container
                    const scale = 0.95 / Math.max(width / fullWidth, height / fullHeight);

                    //calculate translation
                    const translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY];

                    // Apply the zoom transformation with a smooth transition
                    svg.transition()
                        .duration(500) // Adjust the duration as needed
                        .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));

                    // Restart simulation after zooming
                    simulation.restart();
                }

                // Function to zoom in
                function zoomInButtonFunc() {
                    const scale = currentTransform.k * 1.2; // Increase the scale by a factor (e.g., 1.2)
                    svg.call(zoom.scaleTo, scale);
                }

                // Function to zoom out
                function zoomOutButtonFunc() {
                    const scale = currentTransform.k / 1.2; // Decrease the scale by a factor (e.g., 1.2)
                    svg.call(zoom.scaleTo, scale);
                }

                // Function to reset the view to the original state
                function resetView() {
                    // Customize the force simulation, link distance, charge strength, etc., for the original state
                    simulation.force('link').distance(initialLinkDistance);
                    simulation.force('charge').strength(initialChargeStrength);
                    simulation.force('collide').radius(15); // Adjust collide radius for the original state

                    // Restart simulation
                    simulation.alpha(0).restart();

                    // Reset the zoom level
                    svg.call(zoom.transform, initialTransform);
                }

                // Function to dynamically adjust label font size to prevent overlap
                function updateLabelFontSize() {
                    label.each(function (d) {
                        const labelNode = d3.select(this);
                        const bbox = labelNode.node().getBBox();
                        const scale = Math.min(1, Math.sqrt((d.labelArea || 1) / (bbox.width * bbox.height))) * 2.5; // Adjust the factor (0.8) as needed
                        const fontSize = d.initialFontSize * scale;

                        // Apply the updated font size
                        labelNode.style('font-size', `${fontSize}px`);
                    });
                }

                function dragstarted(d) {
                    d3.select(this).attr('cursor', 'grabbing')
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;

                    //hide the tooltip for the node being dragged
                    hideTooltipNodeClick(d);
                    hideHoverTooltipNode(d);
                    hideLabelTooltips(d);
                };

                function dragged(event, d) {
                    d3.select(this).attr('cursor', 'grabbing')
                    d.fx = event.x;
                    d.fy = event.y;

                    //hide the tooltip for the node being dragged
                    hideTooltipNodeClick(d);
                    hideHoverTooltipNode(d);
                    hideLabelTooltips(d);
                };

                function dragended(event, d) {
                    d3.select(this).attr('cursor', 'grab')
                    if (!event.active) simulation.alphaTarget(0);
                    d.fx = d.x;
                    d.fy = d.y;
                    startTimer();
                };

                //Adjust collide force radius based on zoom level
                const adjustedCollideRadius = 12 / zoomScale; // Adjust as needed

                simulation.force('link').distance(adjustedLinkDistance);
                simulation.force('charge').strength(adjustedChargeStrength);
                simulation.force('collide').radius(adjustedCollideRadius);
                simulation.force('linkCollide', d3.forceCollide(linkCollideRadius));
                simulation.force('link').distance(d => {
                    return d.source === d.target ? relatedLinkDistance : unrelatedLinkDistance
                });

                g.attr('transform', event.transform);


                //Adjust font size according to zoom level
                label.style('font-size', `${16 / currentTransform.k}px`);
                startTimer();
            }

            // Define your D3 graph here using the processed data
            // Example: node.data(nodes).enter().append('circle')...

            // Example of updating nodes and links
            node.data(graphData.nodes).join("circle")
                .attr("r", 5)
                .attr("fill", color);

            link.data(graphData.links).join("line");

            simulation.nodes(graphData.nodes);
            simulation.force("link").links(graphData.links);

            // Update the graph on each tick of the simulation
    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y)
            .attr('transform', `translate(${initialCenterX},${initialCenterY})`);
        node
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', getNodeRadius) // Update node radius
            .attr('transform', `translate(${initialCenterX},${initialCenterY})`);

        label
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .attr('transform', `translate(${initialCenterX},${initialCenterY})`);

        // Adjust link distance and charge strength on every tick
        const zoomScale = currentTransform.k;

        //Check if d3.event is defined before accessing its properties
        if (d3.event) {
            label.style('font-size', `${16 / currentTransform.k}px`); //Adjust font size according to zoom level
        }

        // Calculate label bounding box area and update font size
        label.each(function (d) {
            d.labelArea = this.getBBox().width * this.getBBox().height;
        });

        updateLabelFontSize();
    });
    //left off here

            // Add more D3 operations as needed, based on your d3_viz.js logic
        };

        createGraph();
    }, [graphData, dimensions.width, dimensions.height]);

    useEffect(() => {
        // This effect handles resizing
        const handleResize = () => {
            setDimensions({
                width: graphContainerRef.current.clientWidth,
                height: graphContainerRef.current.clientHeight,
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return <div ref={graphContainerRef} style={{ width: '100%', height: '100%' }} />;
};

export default GraphComponent;
