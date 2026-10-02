/**
 * Geographic allocation doughnuts ([data-geo-chart]) — reads labels, values
 * and slice colours from the canvas's own data attributes (rendered by the
 * HUB Holdings Geographic Chart block) and draws a Chart.js doughnut. No
 * legend (the sibling table is the legend); tooltips read "Region: x.x%".
 * Silently skips everything if the vendored Chart.js global isn't there.
 */
export function initGeoCharts() {
	if ( typeof window.Chart === 'undefined' ) {
		return;
	}

	document.querySelectorAll( '[data-geo-chart]' ).forEach( ( canvas ) => {
		let labels = [];
		let values = [];
		let colors = [];

		try {
			labels = JSON.parse( canvas.getAttribute( 'data-labels' ) || '[]' );
			values = JSON.parse( canvas.getAttribute( 'data-values' ) || '[]' );
			colors = JSON.parse( canvas.getAttribute( 'data-colors' ) || '[]' );
		} catch ( err ) {
			return;
		}

		if ( ! labels.length || ! values.length ) {
			return;
		}

		new window.Chart( canvas, {
			type: 'doughnut',
			data: {
				labels,
				datasets: [
					{
						data: values,
						backgroundColor: colors,
						borderColor: '#ffffff',
						borderWidth: 2,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: true,
				cutout: '70%',
				plugins: {
					legend: { display: false },
					tooltip: {
						callbacks: {
							label: ( context ) => ` ${ context.parsed }%`,
						},
					},
				},
			},
		} );
	} );
}
