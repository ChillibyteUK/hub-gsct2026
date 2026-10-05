/**
 * Return performance bar chart ([data-return-chart]) — reads period
 * labels and per-leg datasets from the canvas's own data attributes
 * (rendered by the HUB Return Performance block from its hand-entered
 * cumulative values) and draws a grouped Chart.js bar chart. Legend is
 * hand-rendered HTML beside the canvas; the tooltip is Chart.js's own,
 * skinned light. Silently skips everything if the vendored Chart.js
 * global isn't there.
 */
export function initReturnPerformance() {
	if ( typeof window.Chart === 'undefined' ) {
		return;
	}

	const periodNames = {
		'1M': '1 MONTH',
		YTD: 'YEAR TO DATE',
		'1Y': '1 YEAR',
		'3Y': '3 YEARS',
		'5Y': '5 YEARS',
	};

	document.querySelectorAll( '[data-return-chart]' ).forEach( ( canvas ) => {
		let labels = [];
		let datasets = [];

		try {
			labels = JSON.parse( canvas.getAttribute( 'data-labels' ) || '[]' );
			datasets = JSON.parse( canvas.getAttribute( 'data-datasets' ) || '[]' );
		} catch ( err ) {
			return;
		}

		if ( ! labels.length || ! datasets.length ) {
			return;
		}

		new window.Chart( canvas, {
			type: 'bar',
			data: {
				labels,
				datasets: datasets.map( ( set ) => ( {
					label: set.label,
					data: set.data,
					backgroundColor: set.color,
					borderRadius: 3,
					borderSkipped: 'start',
					categoryPercentage: 0.6,
					barPercentage: 0.7,
				} ) ),
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					tooltip: {
						backgroundColor: '#ffffff',
						titleColor: '#1e1e1e',
						bodyColor: '#1e1e1e',
						borderColor: '#e0e0e0',
						borderWidth: 1,
						padding: 12,
						displayColors: true,
						boxPadding: 4,
						callbacks: {
							title: ( items ) => periodNames[ items[ 0 ].label ] || items[ 0 ].label,
							label: ( context ) => ` ${ context.dataset.label } ${ Number( context.parsed.y ).toFixed( 2 ) }%`,
							labelColor: ( context ) => ( {
								borderColor: context.dataset.backgroundColor,
								backgroundColor: context.dataset.backgroundColor,
							} ),
						},
					},
				},
				scales: {
					x: {
						grid: { display: false },
					},
					y: {
						beginAtZero: true,
						ticks: {
							// Fixed 10-point lattice (always a multiple of
							// 10, so 0% is unavoidably a tick) with auto-skip
							// off: at 210px tall the auto lattice anchors at
							// the data min instead (-5, 5, 15…) and the
							// render pass then drops every other tick,
							// deleting the 0% baseline the bars hang off.
							stepSize: 10,
							autoSkip: false,
							callback: ( value ) => `${ value }%`,
						},
						grid: {
							color: '#e5e5e5',
						},
					},
				},
			},
		} );
	} );
}
