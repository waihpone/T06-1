const populateFilters = (data) => {
    d3.select('#filters_screen')
        .selectAll('.filter')
        .data(filters_screen)
        .join('button')
        .attr('class', d => `filter ${d.isActive ? 'active' : ''}`)
        .text(d => d.label)
        .on('click', (e, d) => {
            console.log('Clicked filter:', e);
            console.log('Clicked filter data:', d);

            if (!d.isActive) {
                filters_screen.forEach(filter => {
                    filter.isActive = d.id === filter.id ? true : false;
                });

                d3.selectAll('#filters_screen .filter')
                    .classed('active', filter => filter.id === d.id ? true : false);

                updateHistogram(d.id, data);
            }
        });
    
    const updateHistogram = (filterId, data) => {
        // Apply both filters together, prefer explicit techId passed from handler
        applyCombinedFilters(data, { techId: filterId });
    };
}

// --- Size filters (non-invasive add) ---
const populateSizeFilters = (data) => {
    // place the size filters under the histogram element
    const histEl = d3.select('#histogram').node();
    if (!histEl) return;

    let container = d3.select('#filters_size');
    if (container.empty()) {
        const el = document.createElement('div');
        el.id = 'filters_size';
        el.className = 'filters_size';
        histEl.insertAdjacentElement('afterend', el);
        container = d3.select('#filters_size');
    }

    container.selectAll('.filter')
        .data(filters_size)
        .join('button')
        .attr('class', d => `filter ${d.isActive ? 'active' : ''}`)
        .text(d => d.label)
        .on('click', (e, d) => {
            if (!d.isActive) {
                filters_size.forEach(filter => {
                    filter.isActive = d.id === filter.id ? true : false;
                });

                container.selectAll('.filter')
                    .classed('active', filter => filter.id === d.id ? true : false);

                updateHistogramSize(d.id, data);
            }
        });

    const updateHistogramSize = (filterId, data) => {
        // Apply both filters together, prefer explicit sizeId passed from handler
        applyCombinedFilters(data, { sizeId: filterId });
    };
}
// Minimal combined filter applier — keeps transitions and behavior consistent
// Accepts optional overrides so callers can pass the clicked filter id directly.
const applyCombinedFilters = (data, { techId = null, sizeId = null } = {}) => {
    const activeTech = techId !== null
        ? { id: techId }
        : (filters_screen.find(f => f.isActive) || { id: 'all' });

    const activeSize = sizeId !== null
        ? { id: sizeId }
        : (filters_size.find(f => f.isActive) || { id: 'all' });

    let filtered = data;
    if (activeTech.id !== 'all') filtered = filtered.filter(tv => tv.screenTech === activeTech.id);
    if (activeSize.id !== 'all') filtered = filtered.filter(tv => +tv.screenSize === +activeSize.id);

    const updatedBins = binGenerator(filtered);

    d3.selectAll('#histogram rect')
        .data(updatedBins)
        .transition()
            .duration(500)
            .ease(d3.easeCubicInOut)
            .attr('y', d => yScale(d.length))
            .attr('height', d => innerHeight - yScale(d.length));
};

const createTooltip = () => {
    const tooltip = innerChartS
        .append('g')
            .attr('class', 'tooltip')
            .style('opacity', 0);
            
    tooltip
    .append('rect')
        .attr('width', tooltipWidth)
        .attr('height', tooltipHeight)
        .attr('rx', 3)
        .attr('ry', 3)
        .attr('fill', barColor)
        .attr('fill-opacity', 0.75);
    
    tooltip
    .append('text')
        .text('NA')
        .attr('x', tooltipWidth / 2)
        .attr('y', tooltipHeight / 2 + 2)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('fill', 'white')
        .style('font-weight', 900);
}

const handleMouseEvents = () => {
    innerChartS.selectAll('circle')
        .on('mouseenter', (e, d) => {
            console.log('Mouse entered circle', d);

            d3.select('.tooltip text')
                .text(d.screenSize);
            
            const cx = e.target.getAttribute('cx');
            const cy = e.target.getAttribute('cy');

            d3.select('.tooltip')
                .attr('transform', `translate(${cx - 0.5 * tooltipWidth}, ${cy - 1.5 * tooltipHeight})`)
                .transition()
                    .duration(200)
                    .style('opacity', 1);
        })
        .on('mouseleave', (e, d) => {
            console.log('Mouse left circle', d);

            d3.select('.tooltip')
                .style('opacity', 0)
                .attr('transform', `translate(0, 500)`);
        });
}