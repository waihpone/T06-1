const drawScatterplot = (data) => {
    // Remove any previous SVG
    d3.select('#scatterplot').selectAll('svg').remove();

    const svg = d3.select('#scatterplot')
        .append('svg')
        .attr("viewBox", `0 0 ${width} ${height}`)
    
    innerChartS = svg
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const bins = binGenerator(data);
    console.log(bins);

    // Use raw data for x and y scales
    const minX = 0;
    const maxX = d3.max(data, d => d.star);
    const minY = d3.min(data, d => d.energyConsumption);
    const maxY = d3.max(data, d => d.energyConsumption);

    xScaleS
        .domain([minX, maxX])
        .range([0, innerWidth]);

    yScaleS
        .domain([minY, maxY])
        .range([innerHeight, 0])
        .nice();
    
    // Use unique screenTech values for color domain
    const techs = Array.from(new Set(data.map(d => d.screenTech)));
    colorScale
        .domain(techs)
        .range(d3.schemeCategory10);
    
    innerChartS
        .selectAll('circle')
        .data(data)
        .join('circle')
            .attr('cx', d => xScaleS(d.star))
            .attr('cy', d => yScaleS(d.energyConsumption))
            .attr('r', 4)
            .attr('fill', d => colorScale(d.screenTech))
            .attr('opacity', 0.5);

    // Add legend for screenTech (move inside chart area, top-right)
    const legendPadding = 10;
    const legendG = innerChartS.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${innerWidth - 80}, ${legendPadding})`);

    legendG.selectAll('legend-dot')
        .data(techs)
        .join('circle')
        .attr('cx', 0)
        .attr('cy', (d, i) => i * 24)
        .attr('r', 8)
        .attr('fill', d => colorScale(d));

    legendG.selectAll('legend-label')
        .data(techs)
        .join('text')
        .attr('x', 18)
        .attr('y', (d, i) => i * 24 + 5)
        .text(d => d)
        .attr('font-size', '14px')
        .attr('alignment-baseline', 'middle');
            
    const bottomAxis = d3.axisBottom(xScaleS);

    innerChartS
        .append('g')
        .attr('transform', `translate(0, ${innerHeight})`)
        .call(bottomAxis);
    
    svg
        .append('text')
        .text("Star Rating")
        .attr('class', 'axis-label')
        .attr('text-anchor', 'end')
        .attr('x', width - 20)
        .attr('y', height - 5)

    const leftAxis = d3.axisLeft(yScaleS);

    innerChartS
        .append('g')
        .call(leftAxis);
    
    svg
        .append('text')
        .text('Labelled Energy Consumption (kWh/year)')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('transform', `rotate(-90)`)
        .attr('x', -margin.top - innerHeight / 2)
        .attr('y', 18);
}