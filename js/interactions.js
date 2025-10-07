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
}